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
const ban_1 = require("../../structs/ban");
const command = {
    data: new command_data_1.default()
        .setName('ban')
        .setAliases('banear', 'baneo')
        .setId('011', '003')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.011.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.011.description'))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.BanMembers)
        .setBotPermissions('BanMembers')
        .setUserPermissions('BanMembers')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('add')
        .setNameLocalization('es-ES', 'aplicar')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.011.add.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.011.add.description'))
        .addStringOption(userOption())
        .addIntegerOption(daysOption())
        .addStringOption(reasonOption()))
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('soft')
        .setNameLocalization('es-ES', 'suave')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.011.soft.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.011.soft.description'))
        .addStringOption(userOption())
        .addIntegerOption(daysOption())
        .addStringOption(reasonOption()))
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('remove')
        .setNameLocalization('es-ES', 'retirar')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.011.remove.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.011.remove.description'))
        .addStringOption(userOption())),
    async exec(interaction) {
        await response(interaction);
    },
    async message(message, args) {
        await response(message, args);
    }
};
exports.command = command;
function userOption() {
    return new discord_js_1.SlashCommandStringOption()
        .setName('user')
        .setNameLocalization('es-ES', 'usuario')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.011.user_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.011.user_option'))
        .setRequired(true);
}
function daysOption() {
    return new discord_js_1.SlashCommandIntegerOption()
        .setName('days')
        .setNameLocalization('es-ES', 'dias')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.011.days_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.011.days_option'))
        .setMinValue(0)
        .setMaxValue(ban_1.MAX_DELETE_DAYS);
}
function reasonOption() {
    return new discord_js_1.SlashCommandStringOption()
        .setName('reason')
        .setNameLocalization('es-ES', 'razon')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.011.reason_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.011.reason_option'));
}
async function response(target, args = []) {
    const operation = target instanceof discord_js_1.ChatInputCommandInteraction
        ? target.options.getSubcommand()
        : normalizeOperation(args[0]);
    // En prefijo la operación solo consume un argumento si de verdad la nombra.
    const rest = target instanceof discord_js_1.ChatInputCommandInteraction || !isOperationWord(args[0])
        ? args
        : args.slice(1);
    switch (operation) {
        case 'soft':
            await (0, ban_1.banUser)(target, rest, 'softban');
            return;
        case 'remove':
            await (0, ban_1.unbanUser)(target, rest);
            return;
        case 'add':
            await (0, ban_1.banUser)(target, rest, 'ban');
            return;
        default: {
            const locale = await (0, moderation_1.moderationLocale)(target);
            await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.011.operation_required'), true);
        }
    }
}
function normalizeOperation(value) {
    const normalized = value?.toLocaleLowerCase();
    if (!normalized)
        return 'add';
    if (['soft', 'suave', 'softban'].includes(normalized))
        return 'soft';
    if (['remove', 'retirar', 'unban', 'desbanear'].includes(normalized))
        return 'remove';
    if (['add', 'aplicar'].includes(normalized))
        return 'add';
    // Sin palabra de operación reconocida se asume un baneo directo.
    return 'add';
}
function isOperationWord(value) {
    const normalized = value?.toLocaleLowerCase();
    if (!normalized)
        return false;
    return [
        'soft', 'suave', 'softban',
        'remove', 'retirar', 'unban', 'desbanear',
        'add', 'aplicar'
    ].includes(normalized);
}
