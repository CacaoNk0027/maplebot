"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURRENT_VERSION = void 0;
exports.versionSeries = versionSeries;
exports.maybeAnnounceUpdate = maybeAnnounceUpdate;
const discord_js_1 = require("discord.js");
const Guild_1 = __importDefault(require("../../shared/bot/models/Guild"));
const config_1 = require("../config/config");
const packageJson = require('../../../package.json');
exports.CURRENT_VERSION = packageJson.version;
/**
 * Serie de una versión: `4.5.2` → `4.5`.
 *
 * El aviso se anuncia por serie y no por versión exacta, porque un parche
 * corrige cosas que al usuario no le aportan nada que leer y recibir el mismo
 * anuncio dos veces en dos días molesta más de lo que informa. Se guarda la
 * versión completa de todos modos: sirve para saber desde dónde actualizó cada
 * servidor, y comparar es lo único que se queda en la serie.
 */
function versionSeries(version) {
    const [major, minor] = version.split('.');
    return `${major}.${minor ?? '0'}`;
}
/**
 * Anuncia una actualización una sola vez por servidor.
 *
 * Se llama tras ejecutar un comando. El camino habitual es que la serie ya
 * esté vista, y entonces solo cuesta una lectura de la caché de `Guild`, que
 * además está caliente porque el prefijo se consulta en cada mensaje. Un parche
 * no vuelve a anunciarse ni escribe nada: sale por la primera guarda.
 *
 * No se anuncia a los servidores que nunca vieron nada: un servidor recién
 * añadido no necesita enterarse de un cambio que no vivió, solo quedar marcado.
 */
async function maybeAnnounceUpdate(guild, channel) {
    const state = await Guild_1.default.getUpdateState(guild.id);
    if (state.lastSeenVersion !== null
        && versionSeries(state.lastSeenVersion) === versionSeries(exports.CURRENT_VERSION))
        return;
    // Se marca antes de enviar: si el envío falla, es preferible perder el
    // aviso a arriesgarse a repetirlo en cada comando.
    await Guild_1.default.markVersionSeen(guild.id, exports.CURRENT_VERSION);
    if (state.lastSeenVersion === null)
        return;
    if (!state.updateNotices)
        return;
    if (!channel)
        return;
    const me = guild.members.me;
    const permissions = me ? channel.permissionsFor(me) : null;
    if (!permissions?.has('SendMessages') || !permissions.has('EmbedLinks'))
        return;
    const locale = await (0, config_1._locale)(guild);
    const prefix = await Guild_1.default.getPrefix(guild.id) || 'm!';
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(config_1.theme_color)
        .setTitle((0, config_1.text)(locale, 'system.001.update.title', exports.CURRENT_VERSION))
        .setDescription((0, config_1.text)(locale, 'system.001.update.body', `${prefix}features`))
        .setFooter({ text: (0, config_1.text)(locale, 'system.001.update.footer', `${prefix}features`) });
    await channel.send({ embeds: [embed] }).catch(error => {
        console.warn('[UpdateNotice:WARN] No se pudo anunciar la actualización:', error);
    });
}
