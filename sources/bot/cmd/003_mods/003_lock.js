"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const config_1 = require("../../../bot/config/config");
const channel_1 = __importDefault(require("../../../bot/structs/channel"));
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const discord_js_1 = require("discord.js");
const command = {
    data: new command_data_1.default()
        .setName('lock')
        .setAliases('lock_channel', 'lockchannel', 'cerrar', 'lck')
        .setId('003', '003')
        .setDescription('Bloquea un canal para @everyone')
        .setDescriptionLocalization('en-US', 'Lock a channel for @everyone')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageChannels)
        .setBotPermissions('ManageChannels')
        .setUserPermissions('ManageChannels')
        .addChannelOption(new discord_js_1.SlashCommandChannelOption()
        .setName('channel')
        .setDescription('Menciona el canal a bloquear')
        .setDescriptionLocalization('en-US', 'The channel to lock')),
    async exec(interaction) {
        lock(interaction);
    },
    async message(message, args) {
        lock(message, args);
    }
};
exports.command = command;
async function lock(target, args) {
    let channel = await new channel_1.default().getInfo(target, args);
    if (!channel) {
        await (0, config_1.send)(target, 'error', 'No se ha podido obtener un canal valido por favor intenta de nuevo', true);
        return;
    }
    if (channel.type != discord_js_1.ChannelType.GuildText) {
        await (0, config_1.send)(target, 'warn', 'El canal debe ser de texto', true);
        return;
    }
    if (!channel.permissionsFor(target.guild?.roles.everyone).has('SendMessages')) {
        await (0, config_1.send)(target, 'warn', 'El canal ya esta bloqueado actualmente', true);
        return;
    }
    try {
        await channel.permissionOverwrites.edit(target.guild?.roles.everyone, {
            SendMessages: false
        });
        await target.reply({
            embeds: [{
                    description: (0, config_1.reply)('ok', `El canal ${channel.name} fue bloqueado con éxito`),
                    color: discord_js_1.Colors.Green
                }]
        });
    }
    catch (error) {
        await (0, config_1.send)(target, 'error', 'El canal no pudo ser bloqueado', true);
        console.error(error);
    }
}
