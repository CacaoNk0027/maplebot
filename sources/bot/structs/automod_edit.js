"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODAL_ID = exports.MENU_ID = void 0;
exports.requestRuleEdit = requestRuleEdit;
exports.handleAutoModEditMenu = handleAutoModEditMenu;
exports.handleAutoModEditModal = handleAutoModEditModal;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const automod_1 = require("./automod");
const automod_create_1 = require("./automod_create");
const MENU_ID = 'menu.006';
exports.MENU_ID = MENU_ID;
const MODAL_ID = 'modal.015';
exports.MODAL_ID = MODAL_ID;
const INPUT_ID = 'automod.edit.value';
const SELECT_ID = 'automod.edit.select';
const keywordLimit = 1_000;
const keywordLength = 60;
const allowListLimit = 100;
const regexLimit = 10;
const regexLength = 260;
const customMessageLength = 150;
const exemptRoleLimit = 20;
const exemptChannelLimit = 50;
const mentionLimitMax = 50;
const timeoutMinuteLimit = 40_320;
/**
 * Campos editables por disparador.
 *
 * `MemberProfile` solo admite `BlockMemberInteraction`, así que no expone
 * mensaje personalizado, alerta, aislamiento ni canales exentos.
 */
const fieldsByTrigger = {
    [discord_js_1.AutoModerationRuleTriggerType.Keyword]: [
        'name', 'keywords', 'regex', 'allow-list',
        'custom-message', 'alert-channel', 'timeout',
        'exempt-roles', 'exempt-channels'
    ],
    [discord_js_1.AutoModerationRuleTriggerType.Spam]: [
        'name', 'custom-message', 'alert-channel', 'exempt-roles', 'exempt-channels'
    ],
    [discord_js_1.AutoModerationRuleTriggerType.KeywordPreset]: [
        'name', 'allow-list', 'custom-message', 'alert-channel', 'exempt-roles', 'exempt-channels'
    ],
    [discord_js_1.AutoModerationRuleTriggerType.MentionSpam]: [
        'name', 'mention-limit', 'custom-message', 'alert-channel', 'timeout',
        'exempt-roles', 'exempt-channels'
    ],
    [discord_js_1.AutoModerationRuleTriggerType.MemberProfile]: [
        'name', 'keywords', 'regex', 'allow-list', 'exempt-roles'
    ]
};
const fieldKinds = {
    'name': 'short',
    'keywords': 'long',
    'regex': 'long',
    'allow-list': 'long',
    'mention-limit': 'short',
    'custom-message': 'long',
    'alert-channel': 'channel',
    'timeout': 'short',
    'exempt-roles': 'roles',
    'exempt-channels': 'channels'
};
/**
 * Un menú de selección admite como máximo 25 elementos, por debajo de los 50
 * canales exentos que permite Discord. Se prefiere la lista a un campo de IDs.
 */
const selectMaxValues = 25;
async function requestRuleEdit(target, rules, identifier, locale) {
    if (!identifier) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.002.rule_required'), true);
        return;
    }
    const resolution = (0, automod_1.resolveAutoModRule)(rules, identifier);
    if (resolution.status === 'ambiguous') {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.002.rule_ambiguous'), true);
        return;
    }
    if (resolution.status === 'missing') {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.002.rule_missing'), true);
        return;
    }
    const rule = resolution.rule;
    const fields = fieldsByTrigger[rule.triggerType] ?? ['name'];
    const ownerId = target instanceof discord_js_1.Message ? target.author.id : target.user.id;
    const menu = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId(`${MENU_ID}:${ownerId}:${rule.id}`)
        .setPlaceholder((0, config_1.text)(locale, 'cmd.003.002.edit.placeholder'))
        .addOptions(fields.map(field => new discord_js_1.StringSelectMenuOptionBuilder()
        .setLabel((0, config_1.text)(locale, `cmd.003.002.edit.field.${field}`))
        .setDescription((0, config_1.text)(locale, `cmd.003.002.edit.description.${field}`))
        .setValue(field)));
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Blurple)
        .setTitle((0, config_1.text)(locale, 'cmd.003.002.edit.title'))
        .setDescription((0, config_1.text)(locale, 'cmd.003.002.edit.prompt', (0, discord_js_1.escapeMarkdown)(rule.name), (0, discord_js_1.inlineCode)(rule.id)))
        .addFields({
        name: (0, config_1.text)(locale, 'cmd.003.002.rule.trigger'),
        value: (0, config_1.text)(locale, (0, automod_1.autoModTriggerKey)(rule.triggerType)),
        inline: true
    });
    const row = new discord_js_1.ActionRowBuilder().addComponents(menu);
    if (target instanceof discord_js_1.Message) {
        await target.reply({ embeds: [embed], components: [row] });
        return;
    }
    await target.reply({ embeds: [embed], components: [row], flags: discord_js_1.MessageFlags.Ephemeral });
}
async function handleAutoModEditMenu(interaction) {
    const locale = await interactionLocale(interaction);
    const ruleId = interaction.customId.split(':')[2];
    const field = interaction.values[0];
    const rule = interaction.guild ? await (0, automod_1.fetchAutoModRule)(interaction.guild, ruleId) : null;
    if (!rule) {
        await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'cmd.003.002.rule_missing'), true);
        return;
    }
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId(`${MODAL_ID}:${rule.id}:${field}`)
        .setTitle((0, config_1.text)(locale, 'cmd.003.002.edit.modal_title'))
        .addLabelComponents(fieldLabel(rule, field, locale));
    await interaction.showModal(modal);
}
function fieldLabel(rule, field, locale) {
    const label = new discord_js_1.LabelBuilder()
        .setLabel((0, config_1.text)(locale, `cmd.003.002.edit.field.${field}`))
        .setDescription((0, config_1.text)(locale, `cmd.003.002.edit.description.${field}`));
    const kind = fieldKinds[field];
    const guild = rule.guild;
    if (kind === 'roles') {
        const current = rule.exemptRoles.filter(role => guild.roles.cache.has(role.id));
        return label.setRoleSelectMenuComponent(new discord_js_1.RoleSelectMenuBuilder()
            .setCustomId(SELECT_ID)
            .setPlaceholder((0, config_1.text)(locale, 'cmd.003.002.edit.roles_placeholder'))
            .setMinValues(0)
            .setMaxValues(exemptRoleLimit)
            .setDefaultRoles(current.map(role => role.id))
            .setRequired(false));
    }
    if (kind === 'channels' || kind === 'channel') {
        const isSingle = kind === 'channel';
        const defaults = isSingle
            ? [findAction(rule, discord_js_1.AutoModerationActionType.SendAlertMessage)?.metadata.channelId]
                .filter((id) => Boolean(id && guild.channels.cache.has(id)))
            : rule.exemptChannels
                .filter(channel => guild.channels.cache.has(channel.id))
                .map(channel => channel.id);
        const menu = new discord_js_1.ChannelSelectMenuBuilder()
            .setCustomId(SELECT_ID)
            .setPlaceholder((0, config_1.text)(locale, 'cmd.003.002.edit.channels_placeholder'))
            .setMinValues(0)
            .setMaxValues(isSingle ? 1 : selectMaxValues)
            .setDefaultChannels(defaults)
            .setRequired(false);
        if (isSingle)
            menu.setChannelTypes(discord_js_1.ChannelType.GuildText, discord_js_1.ChannelType.GuildAnnouncement);
        return label.setChannelSelectMenuComponent(menu);
    }
    const isLong = kind === 'long';
    return label.setTextInputComponent(new discord_js_1.TextInputBuilder()
        .setCustomId(INPUT_ID)
        .setStyle(isLong ? discord_js_1.TextInputStyle.Paragraph : discord_js_1.TextInputStyle.Short)
        .setMaxLength(field === 'custom-message' ? customMessageLength : (isLong ? 4_000 : 200))
        .setRequired(field === 'name')
        .setValue(currentValue(rule, field)));
}
async function handleAutoModEditModal(interaction) {
    const locale = await interactionLocale(interaction);
    const [, ruleId, field] = interaction.customId.split(':');
    if (!interaction.guild) {
        await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'system.003.guild_only'), true);
        return;
    }
    if (!interaction.memberPermissions?.has('ManageGuild')) {
        await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'system.003.permissions.user', 'ManageGuild'), true);
        return;
    }
    const rule = await (0, automod_1.fetchAutoModRule)(interaction.guild, ruleId);
    if (!rule) {
        await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'cmd.003.002.rule_missing'), true);
        return;
    }
    // Los selects se normalizan a una lista de IDs separada por comas, para que
    // la validación sea la misma que la de los campos de texto.
    const kind = fieldKinds[field];
    let raw;
    if (kind === 'roles') {
        raw = [...(interaction.fields.getSelectedRoles(SELECT_ID)?.keys() ?? [])].join(', ');
    }
    else if (kind === 'channel' || kind === 'channels') {
        raw = [...(interaction.fields.getSelectedChannels(SELECT_ID)?.keys() ?? [])].join(', ');
    }
    else {
        raw = interaction.fields.getTextInputValue(INPUT_ID).trim();
    }
    const parsed = buildEdit(rule, field, raw, locale, interaction.guild);
    if (!parsed.ok) {
        await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, parsed.key, ...(parsed.values ?? [])), true);
        return;
    }
    try {
        await rule.edit({
            ...parsed.payload,
            reason: `AutoMod rule edited by ${interaction.user.tag} (${interaction.user.id})`.slice(0, 512)
        });
        await (0, config_1.send)(interaction, 'ok', (0, config_1.text)(locale, 'cmd.003.002.edit.success', (0, config_1.text)(locale, `cmd.003.002.edit.field.${field}`)), true);
    }
    catch (error) {
        console.error('[AutoModEdit:ERR] No se pudo editar la regla:', error);
        await (0, config_1.send)(interaction, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
function currentValue(rule, field) {
    const metadata = rule.triggerMetadata;
    switch (field) {
        case 'name':
            return rule.name;
        case 'keywords':
            return (metadata.keywordFilter ?? []).join(', ');
        case 'regex':
            return (metadata.regexPatterns ?? []).join('\n');
        case 'allow-list':
            return (metadata.allowList ?? []).join(', ');
        case 'mention-limit':
            return metadata.mentionTotalLimit ? String(metadata.mentionTotalLimit) : '';
        case 'custom-message':
            return findAction(rule, discord_js_1.AutoModerationActionType.BlockMessage)?.metadata.customMessage ?? '';
        case 'alert-channel':
            return findAction(rule, discord_js_1.AutoModerationActionType.SendAlertMessage)?.metadata.channelId ?? '';
        case 'timeout': {
            const seconds = findAction(rule, discord_js_1.AutoModerationActionType.Timeout)?.metadata.durationSeconds;
            return seconds ? String(Math.round(seconds / 60)) : '';
        }
        case 'exempt-roles':
            return rule.exemptRoles.map(role => role.id).join(', ');
        case 'exempt-channels':
            return rule.exemptChannels.map(channel => channel.id).join(', ');
    }
}
function buildEdit(rule, field, raw, locale, guild) {
    switch (field) {
        case 'name': {
            if (!raw || raw.length > 100)
                return { ok: false, key: 'cmd.003.002.create.name_invalid' };
            return { ok: true, payload: { name: raw } };
        }
        case 'keywords': {
            const keywords = splitValues(raw);
            if (keywords.length > keywordLimit) {
                return { ok: false, key: 'cmd.003.002.create.keywords_limit', values: [keywordLimit] };
            }
            if (keywords.some(value => value.length > keywordLength)) {
                return { ok: false, key: 'cmd.003.002.create.keyword_length', values: [keywordLength] };
            }
            if (!keywords.length && !(rule.triggerMetadata.regexPatterns ?? []).length) {
                return { ok: false, key: 'cmd.003.002.create.patterns_required' };
            }
            return { ok: true, payload: { triggerMetadata: mergeMetadata(rule, { keywordFilter: keywords }) } };
        }
        case 'regex': {
            const patterns = splitPatterns(raw);
            if (patterns.length > regexLimit) {
                return { ok: false, key: 'cmd.003.002.create.regex_limit', values: [regexLimit] };
            }
            if (patterns.some(value => value.length > regexLength)) {
                return { ok: false, key: 'cmd.003.002.create.regex_length', values: [regexLength] };
            }
            if (!patterns.length && !(rule.triggerMetadata.keywordFilter ?? []).length) {
                return { ok: false, key: 'cmd.003.002.create.patterns_required' };
            }
            return { ok: true, payload: { triggerMetadata: mergeMetadata(rule, { regexPatterns: patterns }) } };
        }
        case 'allow-list': {
            const allowList = splitValues(raw);
            if (allowList.length > allowListLimit) {
                return { ok: false, key: 'cmd.003.002.create.allow_limit', values: [allowListLimit] };
            }
            if (allowList.some(value => value.length > keywordLength)) {
                return { ok: false, key: 'cmd.003.002.create.allow_length', values: [keywordLength] };
            }
            return { ok: true, payload: { triggerMetadata: mergeMetadata(rule, { allowList }) } };
        }
        case 'mention-limit': {
            const limit = Number(raw);
            if (!Number.isInteger(limit) || limit < 1 || limit > mentionLimitMax) {
                return { ok: false, key: 'cmd.003.002.edit.mention_invalid', values: [mentionLimitMax] };
            }
            return { ok: true, payload: { triggerMetadata: mergeMetadata(rule, { mentionTotalLimit: limit }) } };
        }
        case 'custom-message': {
            if (raw.length > customMessageLength) {
                return { ok: false, key: 'cmd.003.002.create.message_length', values: [customMessageLength] };
            }
            const actions = rule.actions.map(action => action.type === discord_js_1.AutoModerationActionType.BlockMessage
                ? { type: action.type, metadata: raw ? { customMessage: raw } : {} }
                : plainAction(action));
            return { ok: true, payload: { actions } };
        }
        case 'alert-channel': {
            const channelId = raw ? raw.match(/\d{16,22}/)?.[0] : null;
            if (raw && !channelId)
                return { ok: false, key: 'cmd.003.002.create.alert_invalid' };
            if (channelId && !guild.channels.cache.has(channelId)) {
                return { ok: false, key: 'cmd.003.002.create.alert_invalid' };
            }
            return { ok: true, payload: { actions: replaceAction(rule, discord_js_1.AutoModerationActionType.SendAlertMessage, channelId ? { channel: channelId } : null) } };
        }
        case 'timeout': {
            if (!raw) {
                return { ok: true, payload: { actions: replaceAction(rule, discord_js_1.AutoModerationActionType.Timeout, null) } };
            }
            const minutes = Number(raw);
            if (!Number.isInteger(minutes) || minutes < 1 || minutes > timeoutMinuteLimit) {
                return { ok: false, key: 'cmd.003.002.create.timeout_invalid', values: [timeoutMinuteLimit] };
            }
            if (!guild.members.me?.permissions.has('ModerateMembers')) {
                return { ok: false, key: 'system.003.permissions.bot', values: ['ModerateMembers'] };
            }
            return {
                ok: true,
                payload: {
                    actions: replaceAction(rule, discord_js_1.AutoModerationActionType.Timeout, {
                        durationSeconds: minutes * 60
                    })
                }
            };
        }
        case 'exempt-roles': {
            const ids = (0, automod_create_1.splitSnowflakes)(raw);
            if (ids.length > exemptRoleLimit) {
                return { ok: false, key: 'cmd.003.002.create.roles_limit', values: [exemptRoleLimit] };
            }
            if (ids.some(id => !guild.roles.cache.has(id))) {
                return { ok: false, key: 'cmd.003.002.create.roles_invalid' };
            }
            return { ok: true, payload: { exemptRoles: ids } };
        }
        case 'exempt-channels': {
            const ids = (0, automod_create_1.splitSnowflakes)(raw);
            if (ids.length > exemptChannelLimit) {
                return { ok: false, key: 'cmd.003.002.create.channels_limit', values: [exemptChannelLimit] };
            }
            if (ids.some(id => !guild.channels.cache.has(id))) {
                return { ok: false, key: 'cmd.003.002.create.channels_invalid' };
            }
            return { ok: true, payload: { exemptChannels: ids } };
        }
    }
}
/**
 * Discord reemplaza los metadatos completos al editar, así que hay que
 * reenviar los que no se tocan.
 */
function mergeMetadata(rule, changes) {
    const metadata = rule.triggerMetadata;
    const base = {};
    switch (rule.triggerType) {
        case discord_js_1.AutoModerationRuleTriggerType.Keyword:
        case discord_js_1.AutoModerationRuleTriggerType.MemberProfile:
            base.keywordFilter = metadata.keywordFilter ?? [];
            base.regexPatterns = metadata.regexPatterns ?? [];
            base.allowList = metadata.allowList ?? [];
            break;
        case discord_js_1.AutoModerationRuleTriggerType.KeywordPreset:
            base.presets = metadata.presets ?? [];
            base.allowList = metadata.allowList ?? [];
            break;
        case discord_js_1.AutoModerationRuleTriggerType.MentionSpam:
            base.mentionTotalLimit = metadata.mentionTotalLimit ?? 5;
            base.mentionRaidProtectionEnabled = metadata.mentionRaidProtectionEnabled ?? false;
            break;
    }
    return { ...base, ...changes };
}
function findAction(rule, type) {
    return rule.actions.find(action => action.type === type);
}
function plainAction(action) {
    const metadata = {};
    if (action.metadata.customMessage)
        metadata.customMessage = action.metadata.customMessage;
    if (action.metadata.channelId)
        metadata.channel = action.metadata.channelId;
    if (action.metadata.durationSeconds)
        metadata.durationSeconds = action.metadata.durationSeconds;
    return { type: action.type, metadata };
}
function replaceAction(rule, type, metadata) {
    const actions = rule.actions
        .filter(action => action.type !== type)
        .map(plainAction);
    if (metadata)
        actions.push({ type, metadata });
    return actions;
}
function splitValues(value) {
    const seen = new Set();
    return value.split(/[\n,]+/).map(entry => entry.trim()).filter(item => {
        const normalized = item.toLocaleLowerCase();
        if (!item || seen.has(normalized))
            return false;
        seen.add(normalized);
        return true;
    });
}
function splitPatterns(value) {
    return [...new Set(value.split(/\n+|;;+/).map(entry => entry.trim()).filter(Boolean))];
}
async function interactionLocale(interaction) {
    return await (0, config_1._locale)(interaction.guild);
}
