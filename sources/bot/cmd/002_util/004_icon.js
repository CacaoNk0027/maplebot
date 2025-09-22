"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const config_1 = require("../../../bot/config/config");
const command = {
    data: new command_data_1.default()
        .setName('icon')
        .setId('004', '002')
        .setAliases('icono')
        .setDescription('Muestra el icono del servidor')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setDescriptionLocalization('en-US', 'Shows the server icon'),
    async exec(interaction) {
        icon(interaction);
    },
    async message(message, args) {
        icon(message);
    }
};
exports.command = command;
async function icon(target) {
    let icon_url = target.guild?.iconURL({ forceStatic: false, size: 1024 });
    if (!icon_url) {
        await (0, config_1.send)(target, 'warn', 'Este servidor no tiene un icono establecido', true);
        return;
    }
    await target.reply({
        embeds: [{
                author: {
                    name: target.guild?.name || 'Servidor',
                },
                color: (0, config_1.random_color)(),
                description: `[URL del icono](${icon_url})`,
                title: `🖼️ | Icono del servidor`,
                image: {
                    url: icon_url
                }
            }]
    });
}
