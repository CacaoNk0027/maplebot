"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAutoModLogSettings = getAutoModLogSettings;
exports.clearAutoModLogCache = clearAutoModLogCache;
exports.sendAutoModLogEmbed = sendAutoModLogEmbed;
exports.logAutoModExecution = logAutoModExecution;
exports.logAutoModRuleChange = logAutoModRuleChange;
const discord_js_1 = require("discord.js");
const Logs_1 = __importDefault(require("../../shared/bot/models/Logs"));
const config_1 = require("../config/config");
const automod_1 = require("./automod");
const LOG_CACHE_TTL = 60_000;
const CONTENT_LIMIT = 900;
const AUDIT_WINDOW = 10_000;
const requiredChannelPermissions = ['ViewChannel', 'SendMessages', 'EmbedLinks'];
const logCache = new Map();
const auditTypeByKind = {
    created: discord_js_1.AuditLogEvent.AutoModerationRuleCreate,
    updated: discord_js_1.AuditLogEvent.AutoModerationRuleUpdate,
    deleted: discord_js_1.AuditLogEvent.AutoModerationRuleDelete
};
const colorByKind = {
    created: discord_js_1.Colors.Green,
    updated: discord_js_1.Colors.Yellow,
    deleted: discord_js_1.Colors.Red
};
async function getAutoModLogSettings(guildId) {
    const cached = logCache.get(guildId);
    if (cached && cached.expiresAt > Date.now())
        return cached.value;
    const document = await Logs_1.default.getByGuildId(guildId);
    const value = document?.automod ? {
        channel: document.automod.channel ?? null,
        executions: document.automod.executions ?? true,
        rules: document.automod.rules ?? true
    } : null;
    logCache.set(guildId, { value, expiresAt: Date.now() + LOG_CACHE_TTL });
    return value;
}
function clearAutoModLogCache(guildId) {
    logCache.delete(guildId);
}
/**
 * Envía un embed al canal de registro de AutoMod, si está configurado.
 *
 * Comparte el interruptor de ejecuciones porque el escalado es consecuencia
 * directa de ellas.
 */
async function sendAutoModLogEmbed(guild, embed) {
    const channel = await resolveLogChannel(guild, settings => settings.executions);
    if (!channel)
        return;
    await channel.send({ embeds: [embed] }).catch(error => {
        console.error('[AutoModLog:ERR] No se pudo enviar el registro:', error);
    });
}
async function logAutoModExecution(execution) {
    const { guild } = execution;
    const channel = await resolveLogChannel(guild, settings => settings.executions);
    if (!channel)
        return;
    const locale = await (0, config_1._locale)(guild);
    const rule = await (0, automod_1.fetchAutoModRule)(guild, execution.ruleId);
    const author = await guild.client.users.fetch(execution.userId).catch(() => null);
    const detected = execution.matchedKeyword || execution.matchedContent;
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Red)
        .setTitle((0, config_1.text)(locale, 'system.003.automod.log.execution.title'))
        .setDescription((0, config_1.text)(locale, 'system.003.automod.log.execution.description', rule ? (0, discord_js_1.escapeMarkdown)(rule.name) : (0, config_1.text)(locale, 'system.003.automod.log.unknown')))
        .addFields({
        name: (0, config_1.text)(locale, 'system.003.automod.log.field.user'),
        value: formatUser(author, execution.userId),
        inline: true
    }, {
        name: (0, config_1.text)(locale, 'system.003.automod.log.field.channel'),
        value: execution.channelId ? `<#${execution.channelId}>` : (0, config_1.text)(locale, 'system.003.automod.log.unknown'),
        inline: true
    }, {
        name: (0, config_1.text)(locale, 'system.003.automod.log.field.trigger'),
        value: (0, config_1.text)(locale, (0, automod_1.autoModTriggerKey)(execution.ruleTriggerType)),
        inline: true
    }, {
        name: (0, config_1.text)(locale, 'system.003.automod.log.field.action'),
        value: (0, config_1.text)(locale, (0, automod_1.autoModActionKey)(execution.action.type)),
        inline: true
    })
        .setTimestamp();
    if (detected) {
        embed.addFields({
            name: (0, config_1.text)(locale, 'system.003.automod.log.field.keyword'),
            value: (0, discord_js_1.inlineCode)(truncate(detected, 200)),
            inline: true
        });
    }
    if (execution.content) {
        embed.addFields({
            name: (0, config_1.text)(locale, 'system.003.automod.log.field.content'),
            value: (0, discord_js_1.escapeMarkdown)(truncate(execution.content, CONTENT_LIMIT))
        });
    }
    if (author)
        embed.setFooter({ text: `ID: ${author.id}`, iconURL: author.displayAvatarURL() });
    await channel.send({ embeds: [embed] }).catch(error => {
        console.error('[AutoModLog:ERR] No se pudo registrar una ejecución de AutoMod:', error);
    });
}
async function logAutoModRuleChange(kind, rule, previous) {
    const { guild } = rule;
    const channel = await resolveLogChannel(guild, settings => settings.rules);
    if (!channel)
        return;
    const locale = await (0, config_1._locale)(guild);
    const actor = await resolveAuditActor(guild, kind, rule.id);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(colorByKind[kind])
        .setTitle((0, config_1.text)(locale, `system.003.automod.log.rule.${kind}`))
        .setDescription((0, config_1.text)(locale, 'system.003.automod.log.rule.description', (0, discord_js_1.escapeMarkdown)(rule.name)))
        .addFields({
        name: (0, config_1.text)(locale, 'system.003.automod.log.field.trigger'),
        value: (0, config_1.text)(locale, (0, automod_1.autoModTriggerKey)(rule.triggerType)),
        inline: true
    }, {
        name: (0, config_1.text)(locale, 'system.003.automod.log.field.state'),
        value: (0, config_1.text)(locale, rule.enabled ? 'cmd.003.002.rule.enabled' : 'cmd.003.002.rule.disabled'),
        inline: true
    }, { name: 'ID', value: (0, discord_js_1.inlineCode)(rule.id), inline: true })
        .setTimestamp();
    if (kind === 'updated' && previous) {
        const changes = describeRuleChanges(previous, rule, locale);
        if (changes) {
            embed.addFields({ name: (0, config_1.text)(locale, 'system.003.automod.log.field.changes'), value: changes });
        }
    }
    if (actor) {
        embed.addFields({
            name: (0, config_1.text)(locale, 'system.003.automod.log.field.actor'),
            value: formatUser(actor, actor.id),
            inline: true
        });
    }
    await channel.send({ embeds: [embed] }).catch(error => {
        console.error('[AutoModLog:ERR] No se pudo registrar un cambio de regla de AutoMod:', error);
    });
}
async function resolveLogChannel(guild, isEnabled) {
    const settings = await getAutoModLogSettings(guild.id).catch(error => {
        console.error('[AutoModLog:ERR] No se pudo consultar la configuración de registros:', error);
        return null;
    });
    if (!settings?.channel || !isEnabled(settings))
        return null;
    const channel = await guild.channels.fetch(settings.channel).catch(() => null);
    if (channel?.type !== discord_js_1.ChannelType.GuildText && channel?.type !== discord_js_1.ChannelType.GuildAnnouncement)
        return null;
    const me = guild.members.me ?? await guild.members.fetchMe().catch(() => null);
    if (!me)
        return null;
    const permissions = channel.permissionsFor(me);
    if (!permissions || requiredChannelPermissions.some(permission => !permissions.has(permission))) {
        console.warn(`[AutoModLog:WARN] Faltan permisos para registrar en el canal ${channel.id} de ${guild.id}`);
        return null;
    }
    return channel;
}
async function resolveAuditActor(guild, kind, ruleId) {
    const me = guild.members.me ?? await guild.members.fetchMe().catch(() => null);
    if (!me?.permissions.has('ViewAuditLog'))
        return null;
    const entries = await guild.fetchAuditLogs({ type: auditTypeByKind[kind], limit: 5 }).catch(() => null);
    if (!entries)
        return null;
    const entry = entries.entries.find(candidate => candidate.targetId === ruleId
        && Date.now() - candidate.createdTimestamp < AUDIT_WINDOW);
    return entry?.executor ?? null;
}
function describeRuleChanges(previous, current, locale) {
    const changes = [];
    if (previous.name !== current.name) {
        changes.push((0, config_1.text)(locale, 'system.003.automod.log.change.name', (0, discord_js_1.escapeMarkdown)(previous.name), (0, discord_js_1.escapeMarkdown)(current.name)));
    }
    if (previous.enabled !== current.enabled) {
        changes.push((0, config_1.text)(locale, 'system.003.automod.log.change.state', (0, config_1.text)(locale, current.enabled ? 'cmd.003.002.rule.enabled' : 'cmd.003.002.rule.disabled')));
    }
    if (previous.actions.length !== current.actions.length) {
        changes.push((0, config_1.text)(locale, 'system.003.automod.log.change.actions', previous.actions.length, current.actions.length));
    }
    return changes.length ? changes.map(change => `• ${change}`).join('\n') : null;
}
function formatUser(user, fallbackId) {
    if (!user)
        return `<@${fallbackId}>`;
    return user.tag ? `${user} (${(0, discord_js_1.escapeMarkdown)(user.tag)})` : `${user}`;
}
function truncate(value, limit) {
    return value.length <= limit ? value : `${value.slice(0, limit - 3)}...`;
}
