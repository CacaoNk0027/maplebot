"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const user_1 = __importDefault(require("../../structs/user"));
const member_1 = __importDefault(require("../../structs/member"));
const config_1 = require("../../config/config");
const command = {
    data: new command_data_1.default()
        .setName('banner')
        .setAliases('fondo')
        .setId('002', '002')
        .setDescription('Muestra tu banner o el de un usuario')
        .setDescriptionLocalization('en-US', 'Shows your banner or another user\'s banner')
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('global')
        .setDescription('Muestra el banner global')
        .setDescriptionLocalization('en-US', 'Shows the global banner')
        .addUserOption(userOption()))
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('server')
        .setDescription('Muestra el banner del servidor')
        .setDescriptionLocalization('en-US', 'Shows the server banner')
        .addUserOption(userOption())),
    async exec(interaction) {
        await response(interaction);
    },
    async message(message, args) {
        await response(message, args);
    }
};
exports.command = command;
function userOption() {
    return new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('El usuario a mostrar')
        .setDescriptionLocalization('en-US', 'The user to show');
}
async function response(caller, args = []) {
    const locale = await (0, config_1._locale)(caller.guild);
    try {
        const mode = caller instanceof discord_js_1.ChatInputCommandInteraction
            ? caller.options.getSubcommand()
            : ['global', 'server'].includes(args[0]?.toLowerCase()) ? args[0].toLowerCase() : 'global';
        if (mode === 'server') {
            if (!caller.guild) {
                await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.guild_only'), true);
                return;
            }
            const member = await new member_1.default().getInfo(caller, args);
            if (!member) {
                await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.member.not_found'), true);
                return;
            }
            await showServerBanner(caller, await member.fetch(), locale);
            return;
        }
        const selectedUser = await new user_1.default().getInfo(caller, args);
        if (!selectedUser) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.user.not_found'), true);
            return;
        }
        await showGlobalBanner(caller, await selectedUser.fetch(), locale);
    }
    catch (error) {
        console.error('[CommandBanner:ERR] No se pudo mostrar el banner:', error);
        await (0, config_1.send)(caller, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
async function showGlobalBanner(caller, user, locale) {
    const bannerURL = user.bannerURL({ forceStatic: false, size: 1024 });
    if (!bannerURL) {
        await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.002.global.none'), true);
        return;
    }
    await caller.reply({
        embeds: [{
                color: user.accentColor || (0, config_1.random_color)(),
                description: (0, config_1.text)(locale, 'cmd.002.002.url', bannerURL),
                image: { url: bannerURL },
                title: (0, config_1.text)(locale, 'cmd.002.002.global.title', user.globalName || user.username)
            }]
    });
}
async function showServerBanner(caller, member, locale) {
    const bannerURL = member.bannerURL({ forceStatic: false, size: 1024 });
    if (!bannerURL) {
        await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.002.server.none'), true);
        return;
    }
    await caller.reply({
        embeds: [{
                color: member.displayColor || member.user.accentColor || (0, config_1.random_color)(),
                description: (0, config_1.text)(locale, 'cmd.002.002.url', bannerURL),
                image: { url: bannerURL },
                title: (0, config_1.text)(locale, 'cmd.002.002.server.title', member.displayName)
            }]
    });
}
