"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modal = void 0;
const config_1 = require("../../../bot/config/config");
const interaction_data_1 = __importDefault(require("../../../bot/structs/interaction_data"));
const discord_js_1 = require("discord.js");
const Welcome_1 = __importDefault(require("../../../shared/bot/models/Welcome"));
const modal = {
    data: new interaction_data_1.default().setId('modal.001'),
    async exec(interaction) {
        const selectedType = interaction.fields.getStringSelectValues('menu.004.001')[0];
        const messageTypes = {
            '1': { name: 'Embed', value: 'embed' },
            '2': { name: 'Imagen', value: 'image' },
            '3': { name: 'Mensaje', value: 'message' }
        };
        const messageType = messageTypes[selectedType];
        if (!messageType || !interaction.guildId) {
            await interaction.reply({
                content: (0, config_1.reply)('error', 'Hubo un error al intentar guardar el tipo de mensaje de bienvenidas.'),
                flags: ['Ephemeral']
            });
            return;
        }
        try {
            await Welcome_1.default.setMessageType(interaction.guildId, messageType.value);
        }
        catch (error) {
            console.error('Error al guardar el tipo de mensaje de bienvenidas:', error);
            await interaction.reply({
                content: (0, config_1.reply)('error', 'Hubo un error al intentar guardar el tipo de mensaje de bienvenidas.'),
                flags: ['Ephemeral']
            });
            return;
        }
        await interaction.reply({
            embeds: [{
                    description: (0, config_1.reply)('ok', `Se ha seleccionado \`${messageType.name}\` como el tipo de mensaje a enviar`),
                    color: discord_js_1.Colors.Green
                }],
            flags: ['Ephemeral']
        });
    }
};
exports.modal = modal;
