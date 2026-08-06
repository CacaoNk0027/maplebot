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
        .setName('unlock')
        .setAliases('unlock_channel', 'unlockchannel', 'abrir', 'ulck')
        .setId('006', '003')
        .setDescription('Desbloquea un canal para @everyone')
        .setDescriptionLocalization('en-US', 'Unlock a channel for @everyone')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageChannels)
        .setBotPermissions('ManageChannels')
        .setUserPermissions('ManageChannels')
        .addChannelOption(new discord_js_1.SlashCommandChannelOption()
        .setName('channel')
        .setDescription('Menciona un canal a desbloquear')
        .setDescriptionLocalization('en-US', 'The channel to unlock')),
    async exec(interaction) {
        unlock(interaction);
    },
    async message(message, args) {
        unlock(message, args);
    }
};
exports.command = command;
async function unlock(target, args) {
    let channel = await new channel_1.default().getInfo(target, args);
    if (!channel) {
        await (0, config_1.send)(target, 'error', 'No se ha podido obtener un canal valido por favor intenta de nuevo', true);
        return;
    }
    if (channel.type != discord_js_1.ChannelType.GuildText) {
        await (0, config_1.send)(target, 'warn', 'El canal debe ser de texto', true);
        return;
    }
    if (channel.permissionsFor(target.guild?.roles.everyone).has('SendMessages')) {
        await (0, config_1.send)(target, 'warn', 'El canal ya esta desbloqueado actualmente', true);
        return;
    }
    try {
        await channel.permissionOverwrites.edit(target.guild?.roles.everyone, {
            SendMessages: true
        });
        await target.reply({
            embeds: [{
                    description: (0, config_1.reply)('ok', `El canal ${channel.name} fue desbloqueado con éxito`),
                    color: discord_js_1.Colors.Green
                }]
        });
    }
    catch (error) {
        await (0, config_1.send)(target, 'error', 'El canal no pudo ser desbloqueado', true);
        console.error(error);
    }
}
