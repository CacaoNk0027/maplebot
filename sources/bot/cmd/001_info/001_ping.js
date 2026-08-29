"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../../bot/config/config");
const Guild_1 = __importDefault(require("../../../shared/bot/models/Guild"));
const command = {
    data: new command_data_1.default()
        .setName('ping')
        .setId('001', '001')
        .setAliases('latencia', 'latency')
        .setDescription('Responde con pong! y muestra la latencia del bot')
        .setDescriptionLocalization('en-US', 'Responds with pong! and shows the bot latency'),
    async exec(interaction) {
        await response(interaction);
    },
    async message(message, args) {
        await response(message);
    },
};
exports.command = command;
async function response(caller) {
    const response = await caller.reply({
        embeds: [{
                color: (0, config_1.random_color)(),
                description: "Ping ping..."
            }]
    });
    const locale = caller.guildId
        ? await Guild_1.default.getLanguage(caller.guildId) ?? caller.guild?.preferredLocale
        : undefined;
    await response.edit({
        embeds: [{
                color: (0, config_1.random_color)(),
                author: {
                    name: `Pong! 🏓`
                },
                description: (0, config_1.code_text)((0, config_1.text)(locale, 'cmd.001.001', Math.floor(caller.client.ws.ping), response.createdTimestamp - caller.createdTimestamp))
            }]
    });
}
