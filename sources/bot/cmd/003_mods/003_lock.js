"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const channel_lock_1 = require("../../structs/channel_lock");
const config_1 = require("../../config/config");
const command = {
    data: new command_data_1.default()
        .setName('lock')
        .setAliases('lock_channel', 'lockchannel', 'cerrar', 'bloquear', 'lck')
        .setId('003', '003')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.003.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.003.description'))
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageChannels)
        .setBotPermissions('ManageChannels')
        .setUserPermissions('ManageChannels')
        .addChannelOption(new discord_js_1.SlashCommandChannelOption()
        .setName('channel')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.003.channel_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.003.channel_option'))
        .addChannelTypes(discord_js_1.ChannelType.GuildText)),
    async exec(interaction) {
        await (0, channel_lock_1.setChannelLock)(interaction, [], true);
    },
    async message(message, args) {
        await (0, channel_lock_1.setChannelLock)(message, args, true);
    }
};
exports.command = command;
