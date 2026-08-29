"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../config/config");
const moderation_1 = require("../../structs/moderation");
const command = {
    data: new command_data_1.default()
        .setName('purgue')
        .setAliases('pg', 'bulkdelete', 'purge', 'purgar', 'limpiar')
        .setId('008', '003')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.008.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.008.description'))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageMessages)
        .setBotPermissions('ManageMessages')
        .setUserPermissions('ManageMessages')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addIntegerOption(new discord_js_1.SlashCommandIntegerOption()
        .setName('number')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.008.number_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.008.number_option'))
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(100)),
    async exec(interaction) {
        await response(interaction);
    },
    async message(message, args) {
        await response(message, args);
    }
};
exports.command = command;
async function response(target, args = []) {
    const locale = await (0, moderation_1.moderationLocale)(target);
    if (!await (0, moderation_1.ensureModerationPermissions)(target, locale, ['ManageMessages'], ['ManageMessages']))
        return;
    if (!target.channel || target.channel.type !== discord_js_1.ChannelType.GuildText) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.channel.text_only'), true);
        return;
    }
    const actor = await target.guild.members.fetch(target instanceof discord_js_1.Message ? target.author.id : target.user.id);
    const bot = await target.guild.members.fetchMe();
    if (!target.channel.permissionsFor(actor).has(discord_js_1.PermissionFlagsBits.ManageMessages)) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.permissions.user', 'ManageMessages'), true);
        return;
    }
    if (!target.channel.permissionsFor(bot).has(discord_js_1.PermissionFlagsBits.ManageMessages)) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.permissions.bot', 'ManageMessages'), true);
        return;
    }
    const amount = target instanceof discord_js_1.ChatInputCommandInteraction
        ? target.options.getInteger('number', true)
        : Number(args[0]);
    if (!Number.isInteger(amount) || amount < 2 || amount > 100) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.008.range'), true);
        return;
    }
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        await target.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
    }
    else {
        try {
            await target.delete();
        }
        catch (error) {
            if (!isUnknownMessage(error)) {
                console.error('[CommandPurge:ERR] No se pudo eliminar el mensaje del comando:', error);
                await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
                return;
            }
        }
    }
    try {
        const deleted = await target.channel.bulkDelete(amount, true);
        const description = (0, config_1.reply)('ok', (0, config_1.text)(locale, 'cmd.003.008.success', amount, deleted.size));
        if (target instanceof discord_js_1.ChatInputCommandInteraction) {
            await target.editReply({ embeds: [{ color: discord_js_1.Colors.Green, description }] });
        }
        else {
            await target.channel.send({ embeds: [{ color: discord_js_1.Colors.Green, description }] });
        }
    }
    catch (error) {
        console.error('[CommandPurge:ERR] No se pudieron eliminar los mensajes:', error);
        if (target instanceof discord_js_1.ChatInputCommandInteraction) {
            await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
        }
        else {
            await target.channel.send({
                embeds: [{ color: discord_js_1.Colors.Red, description: (0, config_1.reply)('error', (0, config_1.text)(locale, 'reply.error')) }]
            });
        }
    }
}
function isUnknownMessage(error) {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 10008;
}
