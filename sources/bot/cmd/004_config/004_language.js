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
const supportedLocales = ['es-ES', 'en-US'];
const command = {
    data: new command_data_1.default()
        .setName('language')
        .setDescription('Consulta o cambia el idioma del servidor')
        .setDescriptionLocalization('en-US', 'View or change the server language')
        .setAliases('lang', 'idioma')
        .setId('004', '004')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild)
        .setUserPermissions('ManageGuild')
        .setCooldown(5)
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('language')
        .setNameLocalization('es-ES', 'idioma')
        .setDescription('Idioma que usará el bot en este servidor')
        .setDescriptionLocalization('en-US', 'Language the bot will use in this server')
        .addChoices({ name: 'Español', value: 'es-ES' }, { name: 'English', value: 'en-US' })),
    async exec(interaction) {
        await response(interaction, interaction.options.getString('language'));
    },
    async message(message, args) {
        await response(message, args[0]);
    }
};
exports.command = command;
async function response(caller, requestedLocale) {
    const currentLocale = await (0, config_1._locale)(caller.guild);
    try {
        if (!caller.guildId) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(currentLocale, 'system.004.guild_only'), true);
            return;
        }
        if (!requestedLocale) {
            await (0, config_1.send)(caller, 'info', (0, config_1.text)(currentLocale, 'cmd.004.004.current', localeName(currentLocale)), true);
            return;
        }
        if (!supportedLocales.includes(requestedLocale)) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(currentLocale, 'cmd.004.004.invalid'), true);
            return;
        }
        const locale = requestedLocale;
        await Guild_1.default.setLanguage(caller.guildId, locale);
        await (0, config_1.send)(caller, 'ok', (0, config_1.text)(locale, 'cmd.004.004.success', localeName(locale)), true);
    }
    catch (error) {
        console.error('[CommandLanguage:ERR] No se pudo consultar o cambiar el idioma:', error);
        await (0, config_1.send)(caller, 'error', (0, config_1.text)(currentLocale, 'reply.error'), true);
    }
}
function localeName(locale) {
    return (0, config_1.text)(locale, locale.toLowerCase().startsWith('en') ? 'locale.en-US' : 'locale.es-ES');
}
