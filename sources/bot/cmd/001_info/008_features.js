"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../config/config");
const Guild_1 = __importDefault(require("../../../shared/bot/models/Guild"));
const update_notice_1 = require("../../structs/update_notice");
/** Cuántas líneas de novedades se publican por versión. */
const ITEMS = 5;
const command = {
    data: new command_data_1.default()
        .setName('features')
        .setAliases('novedades', 'changelog')
        .setId('008', '001')
        .setDescription((0, config_1.text)('es-ES', 'cmd.001.008.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.001.008.description'))
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
        .setName('notices')
        .setNameLocalization('es-ES', 'avisos')
        .setDescription((0, config_1.text)('es-ES', 'cmd.001.008.notices_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.001.008.notices_option'))),
    async exec(interaction) {
        await response(interaction, interaction.options.getBoolean('notices'));
    },
    async message(message, args) {
        await response(message, parseNotices(args));
    }
};
exports.command = command;
/** Palabra opcional antes del valor: `features avisos off` y `features off`. */
const NOTICE_KEYWORDS = ['avisos', 'aviso', 'notices'];
/**
 * Lee el interruptor de avisos de los argumentos del prefijo.
 *
 * Se aceptan las dos formas porque el propio embed sugiere la larga. Sin un
 * valor reconocido se muestran las novedades, que es el uso principal.
 */
function parseNotices(args) {
    const words = args.map(argument => argument.toLocaleLowerCase());
    const value = NOTICE_KEYWORDS.includes(words[0] ?? '') ? words[1] : words[0];
    if (!value)
        return null;
    if (['on', 'activar', 'si', 'yes', 'true'].includes(value))
        return true;
    if (['off', 'desactivar', 'no', 'false'].includes(value))
        return false;
    return null;
}
async function response(target, notices) {
    const locale = await (0, config_1._locale)(target.guild);
    try {
        if (notices !== null) {
            await toggleNotices(target, notices, locale);
            return;
        }
        await showFeatures(target, locale);
    }
    catch (error) {
        console.error('[CommandFeatures:ERR] No se pudieron mostrar las novedades:', error);
        await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
async function showFeatures(target, locale) {
    const prefix = target.guildId ? await Guild_1.default.getPrefix(target.guildId) || 'm!' : 'm!';
    const items = Array.from({ length: ITEMS }, (_, index) => `• ${(0, config_1.text)(locale, `cmd.001.008.item.${index + 1}`)}`);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(config_1.theme_color)
        .setTitle((0, config_1.text)(locale, 'cmd.001.008.title', update_notice_1.CURRENT_VERSION))
        .setDescription(`${(0, config_1.text)(locale, 'cmd.001.008.intro')}\n\n${items.join('\n')}`)
        .addFields({
        name: (0, config_1.text)(locale, 'cmd.001.008.more.name'),
        value: (0, config_1.text)(locale, 'cmd.001.008.more.value', `${prefix}features avisos off`)
    });
    if (target instanceof discord_js_1.Message) {
        await target.reply({ embeds: [embed] });
        return;
    }
    await target.reply({ embeds: [embed] });
}
/**
 * Activar o desactivar los avisos cambia la configuración del servidor, así que
 * se exige el mismo permiso que el resto de ajustes.
 */
async function toggleNotices(target, enabled, locale) {
    if (!target.guildId) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.004.guild_only'), true);
        return;
    }
    // En una interacción los permisos vienen en el propio payload; buscar el
    // miembro en la caché podría no encontrarlo.
    const permissions = target instanceof discord_js_1.Message
        ? target.member?.permissions ?? null
        : target.memberPermissions;
    if (!permissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild)) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.001.008.notices_denied'), true);
        return;
    }
    await Guild_1.default.setUpdateNotices(target.guildId, enabled);
    await (0, config_1.send)(target, 'ok', (0, config_1.text)(locale, enabled ? 'cmd.001.008.notices_enabled' : 'cmd.001.008.notices_disabled'), true);
}
