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
    data: new interaction_data_1.default().setId('modal.002'),
    async exec(interaction) {
        const channels = interaction.fields.getSelectedChannels('menu.004.002', true, [discord_js_1.ChannelType.GuildText]);
        const channel = [...channels.values()][0];
        if (!channel) {
            await interaction.reply({
                content: '> Debes seleccionar un canal de texto.',
                flags: ['Ephemeral']
            });
            return;
        }
        if (!interaction.guildId) {
            await interaction.reply({
                content: '> Esta configuración solo se puede usar dentro de un servidor.',
                flags: ['Ephemeral']
            });
            return;
        }
        try {
            await Welcome_1.default.setChannel(interaction.guildId, channel.id);
        }
        catch (error) {
            console.error('[Welcome modal] No se pudo guardar el canal:', error);
            await interaction.reply({
                content: (0, config_1.reply)('error', 'Hubo un error al intentar guardar el canal de bienvenidas.'),
                flags: ['Ephemeral']
            });
            return;
        }
        await interaction.reply({
            embeds: [{
                    description: (0, config_1.reply)('ok', `Se ha seleccionado <#${channel.id}> como el canal de bienvenidas`),
                    color: discord_js_1.Colors.Green
                }],
            flags: ['Ephemeral']
        });
    }
};
exports.modal = modal;
