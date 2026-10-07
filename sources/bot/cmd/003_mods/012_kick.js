"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../config/config");
const kick_1 = require("../../structs/kick");
const command = {
    data: new command_data_1.default()
        .setName('kick')
        .setAliases('expulsar', 'echar')
        .setId('012', '003')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.012.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.012.description'))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.KickMembers)
        .setBotPermissions('KickMembers')
        .setUserPermissions('KickMembers')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setNameLocalization('es-ES', 'usuario')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.012.user_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.012.user_option'))
        .setRequired(true))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('reason')
        .setNameLocalization('es-ES', 'razon')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.012.reason_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.012.reason_option'))),
    async exec(interaction) {
        await (0, kick_1.kickMember)(interaction);
    },
    async message(message, args) {
        await (0, kick_1.kickMember)(message, args);
    }
};
exports.command = command;
