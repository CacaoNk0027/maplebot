"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestAutoModRuleCreation = requestAutoModRuleCreation;
exports.autoModRuleActions = autoModRuleActions;
exports.splitSnowflakes = splitSnowflakes;
exports.firstSnowflake = firstSnowflake;
exports.parseOptionalInteger = parseOptionalInteger;
exports.validateCachedEntities = validateCachedEntities;
exports.formatAutoModActions = formatAutoModActions;
exports.formatAutoModMentions = formatAutoModMentions;
exports.autoModAuditReason = autoModAuditReason;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const moderation_1 = require("./moderation");
const automod_1 = require("./automod");
const confirmationTime = 120_000;
async function requestAutoModRuleCreation(options) {
    const { target, rules, locale, draft } = options;
    const permissions = draft.timeoutMinutes === null
        ? ['ManageGuild']
        : ['ManageGuild', 'ModerateMembers'];
    if (draft.timeoutMinutes !== null
        && !await (0, moderation_1.ensureModerationPermissions)(target, locale, [...permissions], [...permissions]))
        return;
    const entityIssue = validateCachedEntities(target, draft, locale);
    if (entityIssue) {
        await (0, config_1.send)(target, 'warn', entityIssue, true);
        return;
    }
    const conflict = options.conflict(rules);
    if (conflict) {
        await (0, config_1.send)(target, 'warn', conflict, true);
        return;
    }
    const ownerId = target instanceof discord_js_1.Message ? target.author.id : target.user.id;
    const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`automod-${options.customId}-create-confirm`)
        .setLabel((0, config_1.text)(locale, 'cmd.003.002.create.confirm'))
        .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
        .setCustomId(`automod-${options.customId}-create-cancel`)
        .setLabel((0, config_1.text)(locale, 'cmd.003.002.create.cancel'))
        .setStyle(discord_js_1.ButtonStyle.Secondary));
    let confirmation;
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        await target.reply({ embeds: [options.preview], components: [row], flags: discord_js_1.MessageFlags.Ephemeral });
        confirmation = await target.fetchReply();
    }
    else {
        confirmation = await target.reply({ embeds: [options.preview], components: [row] });
    }
    const collector = confirmation.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        time: confirmationTime
    });
    collector.on('collect', async (interaction) => {
        if (interaction.user.id !== ownerId) {
            await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'interaction.menu.owner'), true);
            return;
        }
        if (interaction.customId.endsWith('-cancel')) {
            collector.stop('cancelled');
            await interaction.update({
                embeds: [autoModResultEmbed(discord_js_1.Colors.Blue, 'info', (0, config_1.text)(locale, 'cmd.003.002.create.cancelled'))],
                components: []
            });
            return;
        }
        collector.stop('handled');
        try {
            // Confirmar el botón es solo acuse de recibo: si su token ya murió
            // (un tirón del host basta para pasarse de los 3 s), crear la regla
            // sigue siendo lo correcto. El resultado se edita con el token del
            // comando original, que dura 15 minutos y no depende de este.
            await interaction.deferUpdate().catch(error => {
                console.warn('[CommandAutoMod:WARN] No se pudo confirmar el boton; se continua:', error);
            });
            if (!await (0, moderation_1.ensureModerationPermissions)(interaction, locale, [...permissions], [...permissions])) {
                await editAutoModConfirmation(target, confirmation, {
                    embeds: [autoModResultEmbed(discord_js_1.Colors.Red, 'error', (0, config_1.text)(locale, 'cmd.003.002.create.permissions_changed'))],
                    components: []
                });
                return;
            }
            const currentRules = await (0, automod_1.fetchAutoModRules)(target.guild);
            const currentConflict = options.conflict(currentRules);
            if (currentConflict) {
                await editAutoModConfirmation(target, confirmation, {
                    embeds: [autoModResultEmbed(discord_js_1.Colors.Yellow, 'warn', currentConflict)],
                    components: []
                });
                return;
            }
            const currentEntityIssue = await validateCurrentEntities(target, draft, locale);
            if (currentEntityIssue) {
                await editAutoModConfirmation(target, confirmation, {
                    embeds: [autoModResultEmbed(discord_js_1.Colors.Yellow, 'warn', currentEntityIssue)],
                    components: []
                });
                return;
            }
            const created = await options.create();
            await editAutoModConfirmation(target, confirmation, {
                embeds: [creationResultEmbed(created, locale)],
                components: []
            }).catch(updateError => {
                console.warn('[CommandAutoMod:WARN] La regla fue creada, pero no se pudo actualizar la confirmación:', updateError);
            });
        }
        catch (error) {
            console.error('[CommandAutoMod:ERR] No se pudo crear la regla:', error);
            await editAutoModConfirmation(target, confirmation, {
                embeds: [autoModResultEmbed(discord_js_1.Colors.Red, 'error', (0, config_1.text)(locale, 'reply.error'))],
                components: []
            }).catch(updateError => {
                console.error('[CommandAutoMod:ERR] No se pudo actualizar la confirmación de creación:', updateError);
            });
        }
    });
    collector.on('end', async (_, reason) => {
        if (reason !== 'time')
            return;
        await editAutoModConfirmation(target, confirmation, {
            embeds: [autoModResultEmbed(discord_js_1.Colors.Yellow, 'warn', (0, config_1.text)(locale, 'cmd.003.002.create.expired'))],
            components: []
        }).catch(error => {
            console.warn('[CommandAutoMod:WARN] No se pudo cerrar una creación expirada:', error);
        });
    });
}
function autoModRuleActions(draft) {
    const actions = [{
            type: discord_js_1.AutoModerationActionType.BlockMessage,
            metadata: draft.customMessage ? { customMessage: draft.customMessage } : undefined
        }];
    if (draft.alertChannelId) {
        actions.push({
            type: discord_js_1.AutoModerationActionType.SendAlertMessage,
            metadata: { channel: draft.alertChannelId }
        });
    }
    if (draft.timeoutMinutes !== null) {
        actions.push({
            type: discord_js_1.AutoModerationActionType.Timeout,
            metadata: { durationSeconds: draft.timeoutMinutes * 60 }
        });
    }
    return actions;
}
function splitSnowflakes(value) {
    return [...new Set(value.match(/\d{16,22}/g) ?? [])];
}
function firstSnowflake(value) {
    return value.match(/\d{16,22}/)?.[0] ?? null;
}
function parseOptionalInteger(value) {
    if (!value?.trim())
        return null;
    return Number(value.trim());
}
function validateCachedEntities(target, draft, locale) {
    const guild = target.guild;
    if (draft.alertChannelId) {
        const channel = guild.channels.cache.get(draft.alertChannelId);
        if (!channel || ![discord_js_1.ChannelType.GuildText, discord_js_1.ChannelType.GuildAnnouncement].includes(channel.type)) {
            return (0, config_1.text)(locale, 'cmd.003.002.create.alert_invalid');
        }
    }
    if (draft.exemptRoleIds.some(id => !guild.roles.cache.has(id))) {
        return (0, config_1.text)(locale, 'cmd.003.002.create.roles_invalid');
    }
    if (draft.exemptChannelIds.some(id => !guild.channels.cache.has(id))) {
        return (0, config_1.text)(locale, 'cmd.003.002.create.channels_invalid');
    }
    return null;
}
function formatAutoModActions(draft, locale) {
    const actions = [`• ${(0, config_1.text)(locale, 'system.003.automod.action.1')}`];
    if (draft.alertChannelId) {
        actions.push(`• ${(0, config_1.text)(locale, 'system.003.automod.action.2')} — <#${draft.alertChannelId}>`);
    }
    if (draft.timeoutMinutes !== null) {
        actions.push(`• ${(0, config_1.text)(locale, 'system.003.automod.action.3')} — ${(0, config_1.text)(locale, 'cmd.003.002.create.timeout_minutes', draft.timeoutMinutes)}`);
    }
    return actions.join('\n');
}
function formatAutoModMentions(ids, type, limit = 1_024) {
    const formatted = ids.map(id => type === 'role' ? `<@&${id}>` : `<#${id}>`).join(', ');
    return formatted.length <= limit ? formatted : `${formatted.slice(0, limit - 3)}...`;
}
function autoModAuditReason(target, description) {
    const actor = target instanceof discord_js_1.Message ? target.author : target.user;
    return `${description} by ${actor.tag} (${actor.id})`;
}
async function validateCurrentEntities(target, draft, locale) {
    await Promise.all([target.guild.roles.fetch(), target.guild.channels.fetch()]);
    return validateCachedEntities(target, draft, locale);
}
function creationResultEmbed(rule, locale) {
    return new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Green)
        .setTitle((0, config_1.text)(locale, 'cmd.003.002.create.success_title'))
        .setDescription((0, config_1.reply)('ok', (0, config_1.text)(locale, 'cmd.003.002.create.success', (0, discord_js_1.escapeMarkdown)(rule.name))))
        .addFields({
        name: (0, config_1.text)(locale, 'cmd.003.002.create.field.state'),
        value: (0, config_1.text)(locale, rule.enabled ? 'cmd.003.002.rule.enabled' : 'cmd.003.002.rule.disabled'),
        inline: true
    }, { name: 'ID', value: (0, discord_js_1.inlineCode)(rule.id), inline: true });
}
function autoModResultEmbed(color, type, message) {
    return new discord_js_1.EmbedBuilder().setColor(color).setDescription((0, config_1.reply)(type, message));
}
async function editAutoModConfirmation(target, confirmation, payload) {
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        await target.editReply(payload);
        return;
    }
    await confirmation.edit(payload);
}
