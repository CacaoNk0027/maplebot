"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEscalationSettings = getEscalationSettings;
exports.clearEscalationCache = clearEscalationCache;
exports.applyAutoModEscalation = applyAutoModEscalation;
const discord_js_1 = require("discord.js");
const Escalation_1 = __importDefault(require("../../shared/bot/models/Escalation"));
const Infraction_1 = __importDefault(require("../../shared/bot/models/Infraction"));
const config_1 = require("../config/config");
const automod_log_1 = require("./automod_log");
const CONFIG_CACHE_TTL = 60_000;
const DAY_MS = 86_400_000;
/**
 * Ventana en la que se ignoran infracciones consecutivas del mismo usuario.
 *
 * Un mensaje puede activar varias reglas a la vez y cada una emite su propio
 * evento; sin esta guarda el mismo usuario recibiría varias sanciones seguidas
 * por un solo mensaje.
 */
const BURST_WINDOW = 10_000;
const configCache = new Map();
const recentEscalations = new Map();
async function getEscalationSettings(guildId) {
    const cached = configCache.get(guildId);
    if (cached && cached.expiresAt > Date.now())
        return cached.value;
    const document = await Escalation_1.default.getByGuildId(guildId);
    const value = document ? {
        enabled: document.enabled,
        windowDays: document.windowDays,
        steps: document.steps.map(step => ({
            threshold: step.threshold,
            action: step.action,
            minutes: step.minutes ?? null
        }))
    } : null;
    configCache.set(guildId, { value, expiresAt: Date.now() + CONFIG_CACHE_TTL });
    return value;
}
function clearEscalationCache(guildId) {
    configCache.delete(guildId);
}
/**
 * Evalúa si la infracción recién registrada alcanza un escalón y aplica su
 * sanción.
 *
 * El escalón se activa cuando el total dentro de la ventana coincide
 * exactamente con su umbral, de modo que cada escalón se aplica una sola vez
 * por usuario y ventana.
 */
async function applyAutoModEscalation(execution) {
    const { guild } = execution;
    if (!guild || !execution.userId)
        return;
    const settings = await getEscalationSettings(guild.id);
    if (!settings?.enabled || !settings.steps.length)
        return;
    if (isWithinBurstWindow(guild.id, execution.userId))
        return;
    const since = new Date(Date.now() - settings.windowDays * DAY_MS);
    const total = await Infraction_1.default.countByUser(guild.id, execution.userId, since);
    const step = settings.steps.find(candidate => candidate.threshold === total);
    if (!step)
        return;
    const member = await guild.members.fetch(execution.userId).catch(() => null);
    if (!member)
        return;
    const locale = await (0, config_1._locale)(guild);
    const applied = step.action === 'timeout'
        ? await applyTimeout(member, step, locale, total)
        : await applyWarning(execution, member, locale, total);
    if (applied)
        await notifyEscalation(guild, member, step, total, locale);
}
function isWithinBurstWindow(guildId, userId) {
    const key = `${guildId}:${userId}`;
    const last = recentEscalations.get(key);
    const now = Date.now();
    if (last && now - last < BURST_WINDOW)
        return true;
    recentEscalations.set(key, now);
    pruneBurstCache(now);
    return false;
}
function pruneBurstCache(now) {
    for (const [key, timestamp] of recentEscalations) {
        if (now - timestamp >= BURST_WINDOW)
            recentEscalations.delete(key);
    }
}
async function applyTimeout(member, step, locale, total) {
    if (!step.minutes)
        return false;
    if (!member.guild.members.me?.permissions.has('ModerateMembers')) {
        console.warn(`[AutoModEscalation:WARN] Falta ModerateMembers para aislar en ${member.guild.id}`);
        return false;
    }
    if (!member.moderatable) {
        console.warn(`[AutoModEscalation:WARN] No se puede aislar a ${member.id}: jerarquía insuficiente`);
        return false;
    }
    const reason = (0, config_1.text)(locale, 'system.003.escalation.reason', total);
    await member.timeout(step.minutes * 60_000, reason).catch(error => {
        console.error('[AutoModEscalation:ERR] No se pudo aplicar el aislamiento:', error);
        throw error;
    });
    return true;
}
async function applyWarning(execution, member, locale, total) {
    const channel = execution.channelId
        ? await member.guild.channels.fetch(execution.channelId).catch(() => null)
        : null;
    if (channel?.type !== discord_js_1.ChannelType.GuildText && channel?.type !== discord_js_1.ChannelType.GuildAnnouncement) {
        return true;
    }
    const permissions = member.guild.members.me
        ? channel.permissionsFor(member.guild.members.me)
        : null;
    if (!permissions?.has('SendMessages'))
        return true;
    await channel.send({
        content: (0, config_1.text)(locale, 'system.003.escalation.warn', `<@${member.id}>`, total)
    }).catch(error => {
        console.warn('[AutoModEscalation:WARN] No se pudo enviar el aviso:', error);
    });
    return true;
}
async function notifyEscalation(guild, member, step, total, locale) {
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(step.action === 'timeout' ? discord_js_1.Colors.DarkRed : discord_js_1.Colors.Yellow)
        .setTitle((0, config_1.text)(locale, 'system.003.escalation.log.title'))
        .setDescription((0, config_1.text)(locale, 'system.003.escalation.log.description', (0, discord_js_1.escapeMarkdown)(member.user.tag), total))
        .addFields({
        name: (0, config_1.text)(locale, 'system.003.escalation.field.user'),
        value: `${member.user} (${(0, discord_js_1.escapeMarkdown)(member.user.tag)})`,
        inline: true
    }, {
        name: (0, config_1.text)(locale, 'system.003.escalation.field.action'),
        value: (0, config_1.text)(locale, `system.003.escalation.action.${step.action}`),
        inline: true
    })
        .setTimestamp();
    if (step.action === 'timeout' && step.minutes) {
        embed.addFields({
            name: (0, config_1.text)(locale, 'system.003.escalation.field.until'),
            value: (0, discord_js_1.time)(new Date(Date.now() + step.minutes * 60_000), 'R'),
            inline: true
        });
    }
    await (0, automod_log_1.sendAutoModLogEmbed)(guild, embed);
}
