"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modal = void 0;
const Farewell_1 = __importDefault(require("../../../shared/bot/models/Farewell"));
const config_1 = require("../../config/config");
const interaction_data_1 = __importDefault(require("../../structs/interaction_data"));
const discord_js_1 = require("discord.js");
const hex_color_regex_1 = __importDefault(require("hex-color-regex"));
const modal = {
    data: new interaction_data_1.default().setId('modal.013'),
    async exec(interaction) {
        const selected = interaction.fields.getStringSelectValues('menu.005.006')[0];
        const value = interaction.fields.getTextInputValue('menu.005.006.value').trim();
        if (!selected || !interaction.guildId) {
            await interaction.reply({
                content: (0, config_1.reply)('error', 'Hubo un error al intentar guardar el fondo de despedida.'),
                flags: ['Ephemeral']
            });
            return;
        }
        let type;
        let backgroundValue;
        if (selected === 'default') {
            type = 'color';
            backgroundValue = value || '#1a1d1f';
            if (!(0, hex_color_regex_1.default)({ strict: true }).test(backgroundValue)) {
                await interaction.reply({
                    content: (0, config_1.reply)('error', 'El color debe tener formato hexadecimal, por ejemplo `#1a1d1f`.'),
                    flags: ['Ephemeral']
                });
                return;
            }
        }
        else if (selected === 'custom') {
            type = 'image';
            backgroundValue = value;
            try {
                const url = new URL(backgroundValue);
                if (url.protocol !== 'https:' && url.protocol !== 'http:')
                    throw new Error('Invalid protocol');
            }
            catch {
                await interaction.reply({
                    content: (0, config_1.reply)('error', 'Debes indicar una URL valida de imagen usando `https://` o `http://`.'),
                    flags: ['Ephemeral']
                });
                return;
            }
        }
        else {
            await interaction.reply({
                content: (0, config_1.reply)('error', 'Tipo de fondo desconocido.'),
                flags: ['Ephemeral']
            });
            return;
        }
        try {
            await Farewell_1.default.setBackground(interaction.guildId, type, backgroundValue);
        }
        catch (error) {
            console.error('Error al guardar el fondo de despedida:', error);
            await interaction.reply({
                content: (0, config_1.reply)('error', 'Hubo un error al intentar guardar el fondo de despedida.'),
                flags: ['Ephemeral']
            });
            return;
        }
        await interaction.reply({
            embeds: [{
                    description: (0, config_1.reply)('ok', type === 'color'
                        ? `Se ha establecido el color de fondo \`${backgroundValue}\`.`
                        : 'Se ha establecido una imagen de fondo.'),
                    color: discord_js_1.Colors.Green
                }],
            flags: ['Ephemeral']
        });
    }
};
exports.modal = modal;
