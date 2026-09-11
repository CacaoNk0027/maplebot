"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const automod_1 = require("../../structs/automod");
const moderation_1 = require("../../structs/moderation");
const automod_keyword_1 = require("../../structs/automod_keyword");
const automod_mention_1 = require("../../structs/automod_mention");
const automod_preset_1 = require("../../structs/automod_preset");
const automod_spam_1 = require("../../structs/automod_spam");
const automod_member_profile_1 = require("../../structs/automod_member_profile");
const automod_edit_1 = require("../../structs/automod_edit");
const config_1 = require("../../config/config");
const command = {
    data: new command_data_1.default()
        .setName('automod')
        .setAliases('automoderacion', 'automoderation', 'adm')
        .setId('002', '003')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.description'))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild)
        .setBotPermissions('ManageGuild')
        .setUserPermissions('ManageGuild')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('status')
        .setNameLocalization('es-ES', 'estado')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.status.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.status.description')))
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('list')
        .setNameLocalization('es-ES', 'lista')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.list.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.list.description')))
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('view')
        .setNameLocalization('es-ES', 'ver')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.view.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.view.description'))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('rule')
        .setNameLocalization('es-ES', 'regla')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.rule_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.rule_option'))
        .setRequired(true)))
        .addSubcommand(ruleMutationSubcommand('enable', 'activar', 'cmd.003.002.enable.description'))
        .addSubcommand(ruleMutationSubcommand('disable', 'desactivar', 'cmd.003.002.disable.description'))
        .addSubcommand(ruleMutationSubcommand('delete', 'eliminar', 'cmd.003.002.delete.description'))
        .addSubcommand(ruleMutationSubcommand('edit', 'editar', 'cmd.003.002.edit.description'))
        .addSubcommand(keywordCreationSubcommand())
        .addSubcommand(mentionCreationSubcommand())
        .addSubcommand(presetCreationSubcommand())
        .addSubcommand(spamCreationSubcommand())
        .addSubcommand(memberProfileCreationSubcommand()),
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
        const rules = await (0, automod_1.fetchAutoModRules)(target.guild);
        const operation = target instanceof discord_js_1.ChatInputCommandInteraction
            ? target.options.getSubcommand()
            : normalizeOperation(args[0]);
        switch (operation) {
            case 'status':
                await showStatus(target, rules, locale);
                return;
            case 'list':
                await showList(target, rules, locale);
                return;
            case 'view': {
                const identifier = ruleIdentifier(target, args);
                await showRule(target, rules, identifier, locale);
                return;
            }
            case 'enable':
                await setRuleState(target, rules, ruleIdentifier(target, args), true, locale);
                return;
            case 'disable':
                await setRuleState(target, rules, ruleIdentifier(target, args), false, locale);
                return;
            case 'delete':
                await requestRuleDeletion(target, rules, ruleIdentifier(target, args), locale);
                return;
            case 'edit':
                await (0, automod_edit_1.requestRuleEdit)(target, rules, ruleIdentifier(target, args), locale);
                return;
            case 'create-keyword':
                await (0, automod_keyword_1.requestKeywordRuleCreation)(target, rules, args, locale);
                return;
            case 'create-mention-spam':
                await (0, automod_mention_1.requestMentionRuleCreation)(target, rules, args, locale);
                return;
            case 'create-preset':
                await (0, automod_preset_1.requestPresetRuleCreation)(target, rules, args, locale);
                return;
            case 'create-spam':
                await (0, automod_spam_1.requestSpamRuleCreation)(target, rules, args, locale);
                return;
            case 'create-member-profile':
                await (0, automod_member_profile_1.requestMemberProfileRuleCreation)(target, rules, args, locale);
                return;
            default:
                await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.002.operation_required'), true);
        }
    }
    catch (error) {
        console.error('[CommandAutoMod:ERR] No se pudieron consultar las reglas de AutoMod:', error);
        await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
function normalizeOperation(value) {
    const normalized = value?.toLocaleLowerCase();
    if (!normalized)
        return 'status';
    if (['estado', 'resumen'].includes(normalized))
        return 'status';
    if (['lista', 'listar'].includes(normalized))
        return 'list';
    if (['ver', 'detalle'].includes(normalized))
        return 'view';
    if (['activar', 'habilitar'].includes(normalized))
        return 'enable';
    if (['desactivar', 'deshabilitar'].includes(normalized))
        return 'disable';
    if (['eliminar', 'borrar'].includes(normalized))
        return 'delete';
    if (['editar', 'modificar'].includes(normalized))
        return 'edit';
    if (['crear-palabras', 'crear', 'palabras'].includes(normalized))
        return 'create-keyword';
    if (['crear-menciones', 'menciones', 'mention-spam'].includes(normalized))
        return 'create-mention-spam';
    if (['crear-predefinidas', 'predefinidas', 'preset'].includes(normalized))
        return 'create-preset';
    if (['crear-spam', 'spam', 'spam-general'].includes(normalized))
        return 'create-spam';
    if (['crear-perfil', 'perfil', 'member-profile'].includes(normalized))
        return 'create-member-profile';
    return normalized;
}
function memberProfileCreationSubcommand() {
    return new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('create-member-profile')
        .setNameLocalization('es-ES', 'crear-perfil')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.member_profile.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.member_profile.description'))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('name')
        .setNameLocalization('es-ES', 'nombre')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.name_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.name_option'))
        .setMinLength(1)
        .setMaxLength(100)
        .setRequired(true))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('keywords')
        .setNameLocalization('es-ES', 'palabras')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.keywords_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.keywords_option')))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('regex')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.regex_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.regex_option')))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('allow-list')
        .setNameLocalization('es-ES', 'permitidas')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.allow_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.allow_option')))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('exempt-roles')
        .setNameLocalization('es-ES', 'roles-exentos')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.roles_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.roles_option')))
        .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
        .setName('enabled')
        .setNameLocalization('es-ES', 'activa')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.enabled_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.enabled_option')));
}
function spamCreationSubcommand() {
    return new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('create-spam')
        .setNameLocalization('es-ES', 'crear-spam')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.spam.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.spam.description'))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('name')
        .setNameLocalization('es-ES', 'nombre')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.name_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.name_option'))
        .setMinLength(1)
        .setMaxLength(100)
        .setRequired(true))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('custom-message')
        .setNameLocalization('es-ES', 'mensaje')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.message_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.message_option'))
        .setMaxLength(150))
        .addChannelOption(new discord_js_1.SlashCommandChannelOption()
        .setName('alert-channel')
        .setNameLocalization('es-ES', 'canal-alertas')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.alert_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.alert_option'))
        .addChannelTypes(discord_js_1.ChannelType.GuildText, discord_js_1.ChannelType.GuildAnnouncement))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('exempt-roles')
        .setNameLocalization('es-ES', 'roles-exentos')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.roles_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.roles_option'))
        .setMaxLength(1_000))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('exempt-channels')
        .setNameLocalization('es-ES', 'canales-exentos')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.channels_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.channels_option'))
        .setMaxLength(2_000))
        .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
        .setName('enabled')
        .setNameLocalization('es-ES', 'activa')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.enabled_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.enabled_option')));
}
function presetCreationSubcommand() {
    return new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('create-preset')
        .setNameLocalization('es-ES', 'crear-predefinidas')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.preset.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.preset.description'))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('name')
        .setNameLocalization('es-ES', 'nombre')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.name_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.name_option'))
        .setMinLength(1)
        .setMaxLength(100)
        .setRequired(true))
        .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
        .setName('profanity')
        .setNameLocalization('es-ES', 'lenguaje-ofensivo')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.preset.profanity_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.preset.profanity_option')))
        .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
        .setName('sexual-content')
        .setNameLocalization('es-ES', 'contenido-sexual')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.preset.sexual_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.preset.sexual_option')))
        .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
        .setName('slurs')
        .setNameLocalization('es-ES', 'insultos-discriminatorios')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.preset.slurs_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.preset.slurs_option')))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('allow-list')
        .setNameLocalization('es-ES', 'permitidas')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.allow_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.allow_option'))
        .setMaxLength(6_000))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('custom-message')
        .setNameLocalization('es-ES', 'mensaje')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.message_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.message_option'))
        .setMaxLength(150))
        .addChannelOption(new discord_js_1.SlashCommandChannelOption()
        .setName('alert-channel')
        .setNameLocalization('es-ES', 'canal-alertas')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.alert_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.alert_option'))
        .addChannelTypes(discord_js_1.ChannelType.GuildText, discord_js_1.ChannelType.GuildAnnouncement))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('exempt-roles')
        .setNameLocalization('es-ES', 'roles-exentos')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.roles_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.roles_option'))
        .setMaxLength(1_000))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('exempt-channels')
        .setNameLocalization('es-ES', 'canales-exentos')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.channels_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.channels_option'))
        .setMaxLength(2_000))
        .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
        .setName('enabled')
        .setNameLocalization('es-ES', 'activa')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.enabled_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.enabled_option')));
}
function mentionCreationSubcommand() {
    return new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('create-mention-spam')
        .setNameLocalization('es-ES', 'crear-menciones')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.mention.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.mention.description'))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('name')
        .setNameLocalization('es-ES', 'nombre')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.name_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.name_option'))
        .setMinLength(1)
        .setMaxLength(100)
        .setRequired(true))
        .addIntegerOption(new discord_js_1.SlashCommandIntegerOption()
        .setName('mention-limit')
        .setNameLocalization('es-ES', 'limite-menciones')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.mention.limit_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.mention.limit_option'))
        .setMinValue(1)
        .setMaxValue(50)
        .setRequired(true))
        .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
        .setName('raid-protection')
        .setNameLocalization('es-ES', 'proteccion-raid')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.mention.raid_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.mention.raid_option')))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('custom-message')
        .setNameLocalization('es-ES', 'mensaje')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.message_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.message_option'))
        .setMaxLength(150))
        .addChannelOption(new discord_js_1.SlashCommandChannelOption()
        .setName('alert-channel')
        .setNameLocalization('es-ES', 'canal-alertas')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.alert_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.alert_option'))
        .addChannelTypes(discord_js_1.ChannelType.GuildText, discord_js_1.ChannelType.GuildAnnouncement))
        .addIntegerOption(new discord_js_1.SlashCommandIntegerOption()
        .setName('timeout-minutes')
        .setNameLocalization('es-ES', 'aislamiento-minutos')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.timeout_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.timeout_option'))
        .setMinValue(1)
        .setMaxValue(40_320))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('exempt-roles')
        .setNameLocalization('es-ES', 'roles-exentos')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.roles_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.roles_option'))
        .setMaxLength(1_000))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('exempt-channels')
        .setNameLocalization('es-ES', 'canales-exentos')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.channels_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.channels_option'))
        .setMaxLength(2_000))
        .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
        .setName('enabled')
        .setNameLocalization('es-ES', 'activa')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.enabled_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.enabled_option')));
}
function keywordCreationSubcommand() {
    return new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('create-keyword')
        .setNameLocalization('es-ES', 'crear-palabras')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.description'))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('name')
        .setNameLocalization('es-ES', 'nombre')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.name_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.name_option'))
        .setMinLength(1)
        .setMaxLength(100)
        .setRequired(true))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('keywords')
        .setNameLocalization('es-ES', 'palabras')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.keywords_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.keywords_option'))
        .setMinLength(1)
        .setMaxLength(6_000))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('regex')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.regex_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.regex_option'))
        .setMaxLength(3_000))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('allow-list')
        .setNameLocalization('es-ES', 'permitidas')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.allow_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.allow_option'))
        .setMaxLength(6_000))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('custom-message')
        .setNameLocalization('es-ES', 'mensaje')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.message_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.message_option'))
        .setMaxLength(150))
        .addChannelOption(new discord_js_1.SlashCommandChannelOption()
        .setName('alert-channel')
        .setNameLocalization('es-ES', 'canal-alertas')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.alert_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.alert_option'))
        .addChannelTypes(discord_js_1.ChannelType.GuildText, discord_js_1.ChannelType.GuildAnnouncement))
        .addIntegerOption(new discord_js_1.SlashCommandIntegerOption()
        .setName('timeout-minutes')
        .setNameLocalization('es-ES', 'aislamiento-minutos')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.timeout_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.timeout_option'))
        .setMinValue(1)
        .setMaxValue(40_320))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('exempt-roles')
        .setNameLocalization('es-ES', 'roles-exentos')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.roles_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.roles_option'))
        .setMaxLength(1_000))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('exempt-channels')
        .setNameLocalization('es-ES', 'canales-exentos')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.channels_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.channels_option'))
        .setMaxLength(2_000))
        .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
        .setName('enabled')
        .setNameLocalization('es-ES', 'activa')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.create.enabled_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.create.enabled_option')));
}
function ruleMutationSubcommand(name, spanishName, descriptionKey) {
    return new discord_js_1.SlashCommandSubcommandBuilder()
        .setName(name)
        .setNameLocalization('es-ES', spanishName)
        .setDescription((0, config_1.text)('es-ES', descriptionKey))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', descriptionKey))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('rule')
        .setNameLocalization('es-ES', 'regla')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.002.rule_id_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.002.rule_id_option'))
        .setRequired(true));
}
function ruleIdentifier(target, args) {
    return target instanceof discord_js_1.ChatInputCommandInteraction
        ? target.options.getString('rule', true)
        : args.slice(1).join(' ').trim();
}
async function showStatus(target, rules, locale) {
    const enabled = rules.filter(rule => rule.enabled).size;
    const counts = (0, automod_1.countAutoModRulesByTrigger)(rules);
    const capacity = Object.entries(automod_1.autoModRuleLimits)
        .map(([trigger, limit]) => {
        const triggerType = Number(trigger);
        return `${(0, config_1.text)(locale, (0, automod_1.autoModTriggerKey)(triggerType))}: **${counts.get(triggerType) ?? 0}/${limit}**`;
    })
        .join('\n');
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Blurple)
        .setTitle((0, config_1.text)(locale, 'cmd.003.002.status.title'))
        .setDescription((0, config_1.text)(locale, 'cmd.003.002.read_only'))
        .addFields({
        name: (0, config_1.text)(locale, 'cmd.003.002.status.rules'),
        value: (0, config_1.text)(locale, 'cmd.003.002.status.rules_value', rules.size, enabled, rules.size - enabled),
        inline: true
    }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.status.capacity'),
        value: capacity || (0, config_1.text)(locale, 'cmd.003.002.none')
    });
    await replyWithEmbed(target, embed);
}
async function showList(target, rules, locale) {
    if (!rules.size) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.002.list.empty'), true);
        return;
    }
    const lines = [...rules.values()]
        .sort((left, right) => snowflakeTimestamp(left.id) - snowflakeTimestamp(right.id))
        .map(rule => {
        const state = rule.enabled ? '🟢' : '🔴';
        const name = (0, discord_js_1.escapeMarkdown)(rule.name);
        const trigger = (0, config_1.text)(locale, (0, automod_1.autoModTriggerKey)(rule.triggerType));
        return `${state} **${name}**\n${trigger} · ${(0, discord_js_1.inlineCode)(rule.id)}`;
    });
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Blurple)
        .setTitle((0, config_1.text)(locale, 'cmd.003.002.list.title'))
        .setDescription(lines.join('\n\n'))
        .setFooter({ text: (0, config_1.text)(locale, 'cmd.003.002.list.footer', rules.size) });
    await replyWithEmbed(target, embed);
}
async function showRule(target, rules, identifier, locale) {
    if (!identifier) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.002.rule_required'), true);
        return;
    }
    const result = (0, automod_1.resolveAutoModRule)(rules, identifier);
    if (result.status === 'ambiguous') {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.002.rule_ambiguous'), true);
        return;
    }
    if (result.status === 'missing') {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.002.rule_missing'), true);
        return;
    }
    const rule = result.rule;
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(rule.enabled ? discord_js_1.Colors.Green : discord_js_1.Colors.Red)
        .setTitle((0, discord_js_1.escapeMarkdown)(rule.name))
        .setDescription((0, config_1.text)(locale, rule.enabled
        ? 'cmd.003.002.rule.enabled'
        : 'cmd.003.002.rule.disabled'))
        .addFields({
        name: (0, config_1.text)(locale, 'cmd.003.002.rule.trigger'),
        value: (0, config_1.text)(locale, (0, automod_1.autoModTriggerKey)(rule.triggerType)),
        inline: true
    }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.rule.creator'),
        value: `<@${rule.creatorId}>`,
        inline: true
    }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.rule.actions'),
        value: formatActions(rule, locale)
    }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.rule.metadata'),
        value: formatMetadata(rule, locale)
    }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.rule.exemptions'),
        value: formatExemptions(rule, locale)
    })
        .setFooter({ text: `ID: ${rule.id}` })
        .setTimestamp(snowflakeTimestamp(rule.id));
    await replyWithEmbed(target, embed);
}
async function setRuleState(target, rules, identifier, enabled, locale) {
    const rule = resolveMutableRule(rules, identifier);
    if (!rule) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.002.rule_id_missing'), true);
        return;
    }
    if (isProtectedCommunityMentionRule(target, rule)) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.002.delete.community_mention'), true);
        return;
    }
    if (rule.enabled === enabled) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, enabled ? 'cmd.003.002.enable.already' : 'cmd.003.002.disable.already'), true);
        return;
    }
    await target.guild.autoModerationRules.edit(rule.id, {
        enabled,
        reason: auditReason(target, enabled ? 'enabled' : 'disabled')
    });
    await (0, config_1.send)(target, 'ok', (0, config_1.text)(locale, enabled ? 'cmd.003.002.enable.success' : 'cmd.003.002.disable.success', (0, discord_js_1.escapeMarkdown)(rule.name)), true);
}
async function requestRuleDeletion(target, rules, identifier, locale) {
    const rule = resolveMutableRule(rules, identifier);
    if (!rule) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.002.rule_id_missing'), true);
        return;
    }
    const ownerId = target instanceof discord_js_1.Message ? target.author.id : target.user.id;
    const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('automod-delete-confirm')
        .setLabel((0, config_1.text)(locale, 'cmd.003.002.delete.confirm'))
        .setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder()
        .setCustomId('automod-delete-cancel')
        .setLabel((0, config_1.text)(locale, 'cmd.003.002.delete.cancel'))
        .setStyle(discord_js_1.ButtonStyle.Secondary));
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Red)
        .setTitle((0, config_1.text)(locale, 'cmd.003.002.delete.title'))
        .setDescription((0, config_1.text)(locale, 'cmd.003.002.delete.prompt', (0, discord_js_1.escapeMarkdown)(rule.name), (0, discord_js_1.inlineCode)(rule.id)))
        .setFooter({ text: (0, config_1.text)(locale, 'cmd.003.002.delete.expires') });
    let confirmation;
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        await target.reply({ embeds: [embed], components: [row], flags: discord_js_1.MessageFlags.Ephemeral });
        confirmation = await target.fetchReply();
    }
    else {
        confirmation = await target.reply({ embeds: [embed], components: [row] });
    }
    const collector = confirmation.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        time: 120_000
    });
    collector.on('collect', async (interaction) => {
        if (interaction.user.id !== ownerId) {
            await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'interaction.menu.owner'), true);
            return;
        }
        if (interaction.customId === 'automod-delete-cancel') {
            collector.stop('cancelled');
            await interaction.update({
                embeds: [resultEmbed(discord_js_1.Colors.Blue, 'info', (0, config_1.text)(locale, 'cmd.003.002.delete.cancelled'))],
                components: []
            });
            return;
        }
        collector.stop('handled');
        try {
            await interaction.deferUpdate();
            if (!await (0, moderation_1.ensureModerationPermissions)(interaction, locale, ['ManageGuild'], ['ManageGuild'])) {
                await editConfirmation(target, confirmation, { components: [] });
                return;
            }
            const currentRule = await target.guild.autoModerationRules.fetch(rule.id).catch(() => null);
            if (!currentRule) {
                await editConfirmation(target, confirmation, {
                    embeds: [resultEmbed(discord_js_1.Colors.Yellow, 'warn', (0, config_1.text)(locale, 'cmd.003.002.rule_missing'))],
                    components: []
                });
                return;
            }
            if (isProtectedCommunityMentionRule(target, currentRule)) {
                await editConfirmation(target, confirmation, {
                    embeds: [resultEmbed(discord_js_1.Colors.Yellow, 'warn', (0, config_1.text)(locale, 'cmd.003.002.delete.community_mention'))],
                    components: []
                });
                return;
            }
            await target.guild.autoModerationRules.delete(currentRule.id, auditReason(target, 'deleted'));
            await editConfirmation(target, confirmation, {
                embeds: [resultEmbed(discord_js_1.Colors.Green, 'ok', (0, config_1.text)(locale, 'cmd.003.002.delete.success', (0, discord_js_1.escapeMarkdown)(currentRule.name)))],
                components: []
            });
        }
        catch (error) {
            console.error('[CommandAutoMod:ERR] No se pudo eliminar la regla de AutoMod:', error);
            const message = discordErrorCode(error) === 200006
                ? (0, config_1.text)(locale, 'cmd.003.002.delete.community_mention')
                : (0, config_1.text)(locale, 'reply.error');
            await editConfirmation(target, confirmation, {
                embeds: [resultEmbed(discordErrorCode(error) === 200006 ? discord_js_1.Colors.Yellow : discord_js_1.Colors.Red, discordErrorCode(error) === 200006 ? 'warn' : 'error', message)],
                components: []
            }).catch(() => undefined);
        }
    });
    collector.on('end', async (_, reason) => {
        if (reason !== 'time')
            return;
        await editConfirmation(target, confirmation, {
            embeds: [resultEmbed(discord_js_1.Colors.Yellow, 'warn', (0, config_1.text)(locale, 'cmd.003.002.delete.expired'))],
            components: []
        }).catch(error => {
            console.warn('[CommandAutoMod:WARN] No se pudo cerrar una confirmación expirada:', error);
        });
    });
}
function isProtectedCommunityMentionRule(target, rule) {
    return rule.triggerType === discord_js_1.AutoModerationRuleTriggerType.MentionSpam
        && target.guild.features.includes(discord_js_1.GuildFeature.Community);
}
function discordErrorCode(error) {
    if (!error || typeof error !== 'object' || !('code' in error))
        return null;
    return typeof error.code === 'number' ? error.code : null;
}
function resolveMutableRule(rules, identifier) {
    if (!/^\d{16,22}$/.test(identifier))
        return null;
    return rules.get(identifier) ?? null;
}
function auditReason(target, operation) {
    const actor = target instanceof discord_js_1.Message ? target.author : target.user;
    return `AutoMod rule ${operation} by ${actor.tag} (${actor.id})`;
}
function resultEmbed(color, type, message) {
    return new discord_js_1.EmbedBuilder()
        .setColor(color)
        .setDescription((0, config_1.reply)(type, message));
}
async function editConfirmation(target, confirmation, payload) {
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        await target.editReply(payload);
        return;
    }
    await confirmation.edit(payload);
}
function formatActions(rule, locale) {
    if (!rule.actions.length)
        return (0, config_1.text)(locale, 'cmd.003.002.none');
    return truncate(rule.actions.map(action => {
        const details = [];
        if (action.type === discord_js_1.AutoModerationActionType.SendAlertMessage && action.metadata.channelId) {
            details.push(`<#${action.metadata.channelId}>`);
        }
        if (action.type === discord_js_1.AutoModerationActionType.Timeout && action.metadata.durationSeconds) {
            details.push((0, config_1.text)(locale, 'cmd.003.002.action.timeout', action.metadata.durationSeconds));
        }
        if (action.type === discord_js_1.AutoModerationActionType.BlockMessage && action.metadata.customMessage) {
            details.push((0, discord_js_1.inlineCode)(action.metadata.customMessage));
        }
        const suffix = details.length ? ` — ${details.join(' · ')}` : '';
        return `• ${(0, config_1.text)(locale, (0, automod_1.autoModActionKey)(action.type))}${suffix}`;
    }).join('\n'));
}
function formatMetadata(rule, locale) {
    const metadata = rule.triggerMetadata;
    const lines = [];
    if (metadata.keywordFilter?.length) {
        lines.push((0, config_1.text)(locale, 'cmd.003.002.metadata.keywords', formatValues(metadata.keywordFilter)));
    }
    if (metadata.regexPatterns?.length) {
        lines.push((0, config_1.text)(locale, 'cmd.003.002.metadata.regex', formatValues(metadata.regexPatterns)));
    }
    if (metadata.allowList?.length) {
        lines.push((0, config_1.text)(locale, 'cmd.003.002.metadata.allow_list', formatValues(metadata.allowList)));
    }
    if (metadata.presets?.length) {
        const presets = metadata.presets
            .map(preset => (0, config_1.text)(locale, `system.003.automod.preset.${preset}`))
            .join(', ');
        lines.push((0, config_1.text)(locale, 'cmd.003.002.metadata.presets', presets));
    }
    if (metadata.mentionTotalLimit !== undefined) {
        lines.push((0, config_1.text)(locale, 'cmd.003.002.metadata.mention_limit', metadata.mentionTotalLimit));
    }
    if (metadata.mentionRaidProtectionEnabled !== undefined) {
        lines.push((0, config_1.text)(locale, 'cmd.003.002.metadata.raid_protection', (0, config_1.text)(locale, metadata.mentionRaidProtectionEnabled ? 'cmd.003.002.yes' : 'cmd.003.002.no')));
    }
    return truncate(lines.join('\n') || (0, config_1.text)(locale, 'cmd.003.002.none'));
}
function formatExemptions(rule, locale) {
    const roles = rule.exemptRoles.size
        ? rule.exemptRoles.map(role => `<@&${role.id}>`).join(', ')
        : (0, config_1.text)(locale, 'cmd.003.002.none');
    const channels = rule.exemptChannels.size
        ? rule.exemptChannels.map(channel => `<#${channel.id}>`).join(', ')
        : (0, config_1.text)(locale, 'cmd.003.002.none');
    return truncate([
        (0, config_1.text)(locale, 'cmd.003.002.exemptions.roles', roles),
        (0, config_1.text)(locale, 'cmd.003.002.exemptions.channels', channels)
    ].join('\n'));
}
function formatValues(values) {
    const visible = values.slice(0, 12).map(value => (0, discord_js_1.inlineCode)(value));
    if (values.length > visible.length)
        visible.push(`+${values.length - visible.length}`);
    return visible.join(', ');
}
function snowflakeTimestamp(id) {
    return Number(BigInt(id) >> 22n) + 1_420_070_400_000;
}
function truncate(value, maximum = 1024) {
    return value.length <= maximum ? value : `${value.slice(0, maximum - 1)}…`;
}
async function replyWithEmbed(target, embed) {
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        await target.reply({ embeds: [embed], flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    await target.reply({ embeds: [embed] });
}
