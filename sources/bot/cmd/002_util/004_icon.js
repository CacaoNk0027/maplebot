"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../config/config");
const command = {
    data: new command_data_1.default()
        .setName('icon')
        .setId('004', '002')
        .setAliases('icono')
        .setDescription('Muestra el icono del servidor')
        .setDescriptionLocalization('en-US', 'Shows the server icon')
        .setContexts(discord_js_1.InteractionContextType.Guild),
    async exec(interaction) {
        await response(interaction);
    },
    async message(message) {
        await response(message);
    }
};
exports.command = command;
async function response(caller) {
    const locale = await (0, config_1._locale)(caller.guild);
    try {
        if (!caller.guild) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.guild_only'), true);
            return;
        }
        const iconURL = caller.guild.iconURL({ forceStatic: false, size: 1024 });
        if (!iconURL) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.004.none'), true);
            return;
        }
        await caller.reply({
            embeds: [{
                    author: { name: caller.guild.name },
                    color: (0, config_1.random_color)(),
                    description: (0, config_1.text)(locale, 'cmd.002.004.url', iconURL),
                    image: { url: iconURL },
                    title: (0, config_1.text)(locale, 'cmd.002.004.title')
                }]
        });
    }
    catch (error) {
        console.error('[CommandIcon:ERR] No se pudo mostrar el icono:', error);
        await (0, config_1.send)(caller, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
