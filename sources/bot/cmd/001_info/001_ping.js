"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../../bot/config/config");
const command = {
    data: new command_data_1.default()
        .setName('ping')
        .setId('001', '001')
        .setAliases('latencia', 'latency')
        .setDescription('Responde con pong! y muestra la latencia del bot')
        .setDescriptionLocalization('en-US', 'Responds with pong! and shows the bot latency'),
    async exec(interaction) {
        await interaction.reply({
            embeds: [{
                    color: (0, config_1.random_color)(),
                    description: "Calculando..."
                }]
        }).then(async (response) => {
            response.edit({
                embeds: [{
                        color: (0, config_1.random_color)(),
                        author: {
                            name: `Pong! 🏓`
                        },
                        description: (0, config_1.code_text)(`Cliente: ${Math.floor(interaction.client.ws.ping)}\nMensajes: ${(response.createdTimestamp - interaction.createdTimestamp)}`)
                    }]
            });
        });
    },
    async message(message, args) {
        await message.reply({
            embeds: [{
                    color: (0, config_1.random_color)(),
                    description: "Calculando..."
                }]
        }).then(async (response) => {
            response.edit({
                embeds: [{
                        color: (0, config_1.random_color)(),
                        author: {
                            name: `Pong! 🏓`
                        },
                        description: (0, config_1.code_text)(`Cliente: ${Math.floor(message.client.ws.ping)}\nMensajes: ${(response.createdTimestamp - message.createdTimestamp)}`)
                    }]
            });
        });
    },
};
exports.command = command;
