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
const automod_log_1 = require("../../structs/automod_log");
const Logs_1 = __importDefault(require("../../../shared/bot/models/Logs"));
const requiredChannelPermissions = ['ViewChannel', 'SendMessages', 'EmbedLinks'];
const command = {
    data: new command_data_1.default()
        .setName('logs')
        .setAliases('registros', 'log')
        .setId('005', '004')
        .setDescription((0, config_1.text)('es-ES', 'cmd.004.005.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.004.005.description'))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild)
        .setBotPermissions('ManageGuild')
        .setUserPermissions('ManageGuild')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('status')
        .setNameLocalization('es-ES', 'estado')
        .setDescription((0, config_1.text)('es-ES', 'cmd.004.005.status.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.004.005.status.description')))
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('automod')
        .setDescription((0, config_1.text)('es-ES', 'cmd.004.005.automod.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.004.005.automod.description'))
        .addChannelOption(new discord_js_1.SlashCommandChannelOption()
        .setName('channel')
        .setNameLocalization('es-ES', 'canal')
        .setDescription((0, config_1.text)('es-ES', 'cmd.004.005.channel_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.004.005.channel_option'))
        .addChannelTypes(discord_js_1.ChannelType.GuildText, discord_js_1.ChannelType.GuildAnnouncement)
        .setRequired(true))
        .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
        .setName('executions')
        .setNameLocalization('es-ES', 'ejecuciones')
        .setDescription((0, config_1.text)('es-ES', 'cmd.004.005.executions_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.004.005.executions_option')))
        .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
        .setName('rules')
        .setNameLocalization('es-ES', 'reglas')
        .setDescription((0, config_1.text)('es-ES', 'cmd.004.005.rules_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.004.005.rules_option'))))
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('automod-off')
        .setNameLocalization('es-ES', 'automod-apagar')
        .setDescription((0, config_1.text)('es-ES', 'cmd.004.005.automod_off.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.004.005.automod_off.description'))),
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
    if (!await (0, moderation_1.ensureModerationPermissions)(target, locale, ['ManageGuild'], ['ManageGuild']))
        return;
    try {
        const operation = target instanceof discord_js_1.ChatInputCommandInteraction
            ? target.options.getSubcommand()
            : normalizeOperation(args[0]);
        switch (operation) {
            case 'status':
                await showStatus(target, locale);
                return;
            case 'automod':
                await setAutoModChannel(target, args, locale);
                return;
            case 'automod-off':
                await disableAutoModLog(target, locale);
                return;
            default:
                await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.004.005.operation_required'), true);
        }
    }
    catch (error) {
        console.error('[CommandLogs:ERR] No se pudo consultar o cambiar los registros:', error);
        await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
function normalizeOperation(value) {
    const normalized = value?.toLocaleLowerCase();
    if (!normalized)
        return 'status';
    if (['estado', 'resumen'].includes(normalized))
        return 'status';
    if (['automod-apagar', 'automod-off', 'apagar'].includes(normalized))
        return 'automod-off';
    if (['automod', 'automoderacion'].includes(normalized))
        return 'automod';
    return normalized;
}
async function showStatus(target, locale) {
    const settings = await (0, automod_log_1.getAutoModLogSettings)(target.guildId);
    if (!settings?.channel) {
        await (0, config_1.send)(target, 'info', (0, config_1.text)(locale, 'cmd.004.005.status.disabled'), true);
        return;
    }
    const lines = [
        (0, config_1.text)(locale, 'cmd.004.005.status.channel', `<#${settings.channel}>`),
        (0, config_1.text)(locale, 'cmd.004.005.status.executions', stateLabel(settings.executions, locale)),
        (0, config_1.text)(locale, 'cmd.004.005.status.rules', stateLabel(settings.rules, locale))
    ];
    await (0, config_1.send)(target, 'info', `${(0, config_1.text)(locale, 'cmd.004.005.status.title')}\n${lines.join('\n')}`, true);
}
async function setAutoModChannel(target, args, locale) {
    const channel = await resolveLogChannel(target, args);
    if (!channel) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.004.005.channel_invalid'), true);
        return;
    }
    const missing = missingChannelPermissions(target, channel);
    if (missing.length) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.004.005.channel_permissions', missing.join(', ')), true);
        return;
    }
    const executions = target instanceof discord_js_1.ChatInputCommandInteraction
        ? target.options.getBoolean('executions') ?? undefined
        : undefined;
    const rules = target instanceof discord_js_1.ChatInputCommandInteraction
        ? target.options.getBoolean('rules') ?? undefined
        : undefined;
    await Logs_1.default.updateAutoMod(target.guildId, { channel: channel.id, executions, rules });
    (0, automod_log_1.clearAutoModLogCache)(target.guildId);
    await (0, config_1.send)(target, 'ok', (0, config_1.text)(locale, 'cmd.004.005.saved', `<#${channel.id}>`), true);
}
async function disableAutoModLog(target, locale) {
    const settings = await (0, automod_log_1.getAutoModLogSettings)(target.guildId);
    if (!settings?.channel) {
        await (0, config_1.send)(target, 'info', (0, config_1.text)(locale, 'cmd.004.005.already_disabled'), true);
        return;
    }
    await Logs_1.default.disableAutoMod(target.guildId);
    (0, automod_log_1.clearAutoModLogCache)(target.guildId);
    await (0, config_1.send)(target, 'ok', (0, config_1.text)(locale, 'cmd.004.005.disabled'), true);
}
async function resolveLogChannel(target, args) {
    const guild = target.guild;
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        const selected = target.options.getChannel('channel');
        return selected ? await guild.channels.fetch(selected.id).catch(() => null) : null;
    }
    const mentioned = target.mentions.channels.first();
    const id = mentioned?.id ?? args.map(extractSnowflake).find((value) => Boolean(value));
    if (!id)
        return null;
    const channel = await guild.channels.fetch(id).catch(() => null);
    if (!channel || ![discord_js_1.ChannelType.GuildText, discord_js_1.ChannelType.GuildAnnouncement].includes(channel.type))
        return null;
    return channel;
}
function missingChannelPermissions(target, channel) {
    const me = target.guild.members.me;
    if (!me)
        return [];
    const permissions = channel.permissionsFor(me);
    if (!permissions)
        return [...requiredChannelPermissions];
    return requiredChannelPermissions.filter(permission => !permissions.has(permission));
}
function stateLabel(value, locale) {
    return (0, config_1.text)(locale, value ? 'cmd.004.005.enabled_value' : 'cmd.004.005.disabled_value');
}
function extractSnowflake(value) {
    if (!value)
        return null;
    return value.match(/\d{16,22}/)?.[0] ?? null;
}
