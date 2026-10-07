"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAutoModLogCache = clearAutoModLogCache;
exports.sendAutoModLogEmbed = sendAutoModLogEmbed;
exports.logAutoModExecution = logAutoModExecution;
exports.logAutoModRuleChange = logAutoModRuleChange;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const automod_1 = require("./automod");
const log_dispatch_1 = require("./log_dispatch");
const CONTENT_LIMIT = 900;
const AUDIT_WINDOW = 10_000;
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
/** Alias histórico: la configuración de registros ya es común a todos los eventos. */
function clearAutoModLogCache(guildId) {
    (0, log_dispatch_1.clearLogCache)(guildId);
}
/**
 * Envía un embed al canal de registro de AutoMod, si está configurado.
 *
 * Comparte el interruptor de ejecuciones porque el escalado es consecuencia
 * directa de ellas.
 */
async function sendAutoModLogEmbed(guild, embed) {
    await (0, log_dispatch_1.sendLog)(guild, 'automod.executions', embed);
}
async function logAutoModExecution(execution) {
    const { guild } = execution;
    if (!await (0, log_dispatch_1.isLogEnabled)(guild.id, 'automod.executions'))
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
    await (0, log_dispatch_1.sendLog)(guild, 'automod.executions', embed);
}
async function logAutoModRuleChange(kind, rule, previous) {
    const { guild } = rule;
    if (!await (0, log_dispatch_1.isLogEnabled)(guild.id, 'automod.rules'))
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
    await (0, log_dispatch_1.sendLog)(guild, 'automod.rules', embed);
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
