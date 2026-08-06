"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modal = void 0;
const Welcome_1 = __importDefault(require("../../../shared/bot/models/Welcome"));
const config_1 = require("../../config/config");
const interaction_data_1 = __importDefault(require("../../structs/interaction_data"));
const discord_js_1 = require("discord.js");
const hex_color_regex_1 = __importDefault(require("hex-color-regex"));
const modal = {
    data: new interaction_data_1.default().setId('modal.007'),
    async exec(interaction) {
        const title = interaction.fields.getTextInputValue('menu.004.007.text').trim();
        const description = interaction.fields.getTextInputValue('menu.004.007.background').trim();
        const border = interaction.fields.getTextInputValue('menu.004.007.border').trim();
        if (!interaction.guildId) {
            await interaction.reply({
                content: (0, config_1.reply)('error', 'Esta configuración solo se puede usar dentro de un servidor.'),
                flags: ['Ephemeral']
            });
            return;
        }
        const colors = Object.fromEntries(Object.entries({ title, description, border }).filter(([, value]) => value.length > 0));
        if (Object.keys(colors).length === 0) {
            await interaction.reply({
                content: (0, config_1.reply)('error', 'Debes indicar al menos un color para actualizar.'),
                flags: ['Ephemeral']
            });
            return;
        }
        const invalidColor = Object.values(colors).find(color => !(0, hex_color_regex_1.default)({ strict: true }).test(color));
        if (invalidColor) {
            await interaction.reply({
                content: (0, config_1.reply)('error', 'Los colores deben tener formato hexadecimal, por ejemplo `#1a1d1f`.'),
                flags: ['Ephemeral']
            });
            return;
        }
        try {
            await Welcome_1.default.setColors(interaction.guildId, colors);
        }
        catch (error) {
            console.error('Error al guardar los colores de bienvenida:', error);
            await interaction.reply({
                content: (0, config_1.reply)('error', 'Hubo un error al intentar guardar los colores de bienvenida.'),
                flags: ['Ephemeral']
            });
            return;
        }
        const configuredColors = Object.entries(colors)
            .map(([name, value]) => `**${name}:** \`${value}\``)
            .join('\n');
        await interaction.reply({
            embeds: [{
                    description: (0, config_1.reply)('ok', 'Se actualizaron los colores de bienvenida.'),
                    color: discord_js_1.Colors.Green,
                    fields: [{ name: 'Colores actualizados', value: configuredColors }]
                }],
            flags: ['Ephemeral']
        });
    }
};
exports.modal = modal;
