"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../config/config");
const color_1 = require("../../structs/color");
const command = {
    data: new command_data_1.default()
        .setName('color')
        .setId('007', '002')
        .setAliases('co', 'colour')
        .setDescription('Convierte un color hex a RGB, HSL o viceversa')
        .setDescriptionLocalization('en-US', 'Converts a hex color to RGB, HSL or vice versa')
        .setCooldown(5)
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('color')
        .setDescription('El color que quieres convertir')
        .setDescriptionLocalization('en-US', 'The color you want to convert')
        .setRequired(true)),
    async exec(interaction) {
        await response(interaction);
    },
    async message(message, args) {
        await response(message, args);
    }
};
exports.command = command;
async function response(caller, args = []) {
    const locale = await (0, config_1._locale)(caller.guild);
    try {
        // Por prefijo el color puede venir partido en varios argumentos:
        // "rgb(255, 0, 0)" llega como ["rgb(255,", "0,", "0)"].
        const input = caller instanceof discord_js_1.ChatInputCommandInteraction
            ? caller.options.getString('color', true)
            : args.join(' ');
        if (!input?.trim()) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.007.required'), true);
            return;
        }
        const color = (0, color_1.parseColor)(input);
        if (!color) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.007.invalid'), true);
            return;
        }
        const hex = (0, color_1.toHex)(color);
        const hsl = (0, color_1.toHsl)(color);
        const decimal = (0, color_1.toDecimal)(color);
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle((0, config_1.text)(locale, 'cmd.002.007.title', hex))
            .setColor(decimal)
            .setFields([{
                name: `🎨 | ${(0, config_1.text)(locale, 'cmd.002.007.field.hex')}`,
                value: (0, config_1.code_text)(hex),
                inline: true
            }, {
                name: `🔴 | ${(0, config_1.text)(locale, 'cmd.002.007.field.rgb')}`,
                value: (0, config_1.code_text)(`rgb(${color.r}, ${color.g}, ${color.b})`),
                inline: true
            }, {
                name: `🌈 | ${(0, config_1.text)(locale, 'cmd.002.007.field.hsl')}`,
                value: (0, config_1.code_text)(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`),
                inline: true
            }, {
                name: `🔢 | ${(0, config_1.text)(locale, 'cmd.002.007.field.decimal')}`,
                value: (0, config_1.code_text)(String(decimal)),
                inline: true
            }]);
        await caller.reply({ embeds: [embed] });
    }
    catch (error) {
        console.error('[CommandColor:ERR] No se pudo convertir el color:', error);
        await (0, config_1.send)(caller, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
