"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const timeout_1 = require("../../structs/timeout");
const config_1 = require("../../config/config");
const command = {
    data: new command_data_1.default()
        .setName('unmute')
        .setAliases('desaislar', 'utmo', 'untimeout', 'untmo')
        .setId('005', '003')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.005.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.005.description'))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ModerateMembers)
        .setBotPermissions('ModerateMembers')
        .setUserPermissions('ModerateMembers')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.005.user_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.005.user_option'))
        .setRequired(true))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('reason')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.005.reason_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.005.reason_option'))
        .setMaxLength(400)),
    async exec(interaction) {
        await (0, timeout_1.setMemberTimeout)(interaction, [], true);
    },
    async message(message, args) {
        await (0, timeout_1.setMemberTimeout)(message, args, true);
    }
};
exports.command = command;
