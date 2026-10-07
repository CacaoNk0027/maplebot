"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogSettings = getLogSettings;
exports.clearLogCache = clearLogCache;
exports.isLogEnabled = isLogEnabled;
exports.sendLog = sendLog;
const Logs_1 = __importDefault(require("../../shared/bot/models/Logs"));
const CACHE_TTL = 60_000;
const CHANNEL_PERMISSIONS = ['ViewChannel', 'SendMessages', 'EmbedLinks'];
const cache = new Map();
async function getLogSettings(guildId) {
    const cached = cache.get(guildId);
    if (cached && cached.expiresAt > Date.now())
        return cached.value;
    const value = await Logs_1.default.getSettings(guildId).catch(error => {
        console.error('[LogDispatch:ERR] No se pudo leer la configuración de registros:', error);
        return null;
    });
    cache.set(guildId, { value, expiresAt: Date.now() + CACHE_TTL });
    return value;
}
/** Hay que llamarla tras cualquier escritura en `Logs`, o se seguirá usando el valor viejo. */
function clearLogCache(guildId) {
    cache.delete(guildId);
}
/**
 * Indica si merece la pena construir el registro.
 *
 * Los eventos de mensajes se disparan constantemente: comprobar esto antes de
 * armar el embed evita trabajo inútil en servidores que no lo tienen activado.
 */
async function isLogEnabled(guildId, key) {
    const settings = await getLogSettings(guildId);
    if (!settings)
        return false;
    const event = settings.events[key];
    if (!event?.enabled)
        return false;
    return Boolean(event.channel ?? settings.defaultChannel);
}
/** Envía el registro al canal del evento, o al canal por defecto del servidor. */
async function sendLog(guild, key, embed) {
    const channel = await resolveChannel(guild, key);
    if (!channel)
        return;
    await channel.send({ embeds: [embed] }).catch(error => {
        console.error(`[LogDispatch:ERR] No se pudo enviar el registro ${key}:`, error);
    });
}
async function resolveChannel(guild, key) {
    const settings = await getLogSettings(guild.id);
    if (!settings)
        return null;
    const event = settings.events[key];
    if (!event?.enabled)
        return null;
    const channelId = event.channel ?? settings.defaultChannel;
    if (!channelId)
        return null;
    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel?.isTextBased() || channel.isDMBased())
        return null;
    const me = guild.members.me;
    const permissions = me ? channel.permissionsFor(me) : null;
    if (CHANNEL_PERMISSIONS.some(permission => !permissions?.has(permission)))
        return null;
    return channel;
}
