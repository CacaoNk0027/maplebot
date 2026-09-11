"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPresetRuleCreation = requestPresetRuleCreation;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const automod_1 = require("./automod");
const automod_create_1 = require("./automod_create");
const allowListLimit = 1_000;
const termLength = 60;
const customMessageLength = 150;
const exemptRoleLimit = 20;
const exemptChannelLimit = 50;
async function requestPresetRuleCreation(target, rules, args, locale) {
    const parsed = presetRuleDraft(target, args);
    if (!parsed.ok) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, parsed.key, ...(parsed.values ?? [])), true);
        return;
    }
    const draft = parsed.draft;
    await (0, automod_create_1.requestAutoModRuleCreation)({
        target,
        rules,
        locale,
        draft,
        customId: 'preset',
        preview: presetRulePreview(draft, locale),
        conflict: currentRules => presetRuleConflict(currentRules, draft, locale),
        create: () => target.guild.autoModerationRules.create({
            name: draft.name,
            eventType: discord_js_1.AutoModerationRuleEventType.MessageSend,
            triggerType: discord_js_1.AutoModerationRuleTriggerType.KeywordPreset,
            triggerMetadata: {
                presets: draft.presets,
                allowList: draft.allowList
            },
            actions: (0, automod_create_1.autoModRuleActions)(draft),
            exemptRoles: draft.exemptRoleIds,
            exemptChannels: draft.exemptChannelIds,
            enabled: draft.enabled,
            reason: (0, automod_create_1.autoModAuditReason)(target, 'AutoMod preset keyword rule created')
        })
    });
}
function presetRuleDraft(target, args) {
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        const presets = [
            target.options.getBoolean('profanity') ? discord_js_1.AutoModerationRuleKeywordPresetType.Profanity : null,
            target.options.getBoolean('sexual-content') ? discord_js_1.AutoModerationRuleKeywordPresetType.SexualContent : null,
            target.options.getBoolean('slurs') ? discord_js_1.AutoModerationRuleKeywordPresetType.Slurs : null
        ].filter((preset) => preset !== null);
        return validateDraft({
            name: target.options.getString('name', true).trim(),
            presets,
            allowList: splitValues(target.options.getString('allow-list') ?? ''),
            customMessage: target.options.getString('custom-message')?.trim() || null,
            alertChannelId: target.options.getChannel('alert-channel')?.id ?? null,
            timeoutMinutes: null,
            exemptRoleIds: (0, automod_create_1.splitSnowflakes)(target.options.getString('exempt-roles') ?? ''),
            exemptChannelIds: (0, automod_create_1.splitSnowflakes)(target.options.getString('exempt-channels') ?? ''),
            enabled: target.options.getBoolean('enabled') ?? false
        });
    }
    const sections = args.slice(1).join(' ').split('|').map(value => value.trim());
    if (sections.length < 2)
        return { ok: false, key: 'cmd.003.002.preset.prefix_usage' };
    const presets = parsePrefixPresets(sections[1]);
    if (!presets)
        return { ok: false, key: 'cmd.003.002.preset.categories_invalid' };
    const alertChannelId = (0, automod_create_1.firstSnowflake)(sections[4] ?? '');
    const exemptRoleIds = (0, automod_create_1.splitSnowflakes)(sections[5] ?? '');
    const exemptChannelIds = (0, automod_create_1.splitSnowflakes)(sections[6] ?? '');
    if (sections[4] && !alertChannelId)
        return { ok: false, key: 'cmd.003.002.create.alert_invalid' };
    if (sections[5] && !exemptRoleIds.length)
        return { ok: false, key: 'cmd.003.002.create.roles_invalid' };
    if (sections[6] && !exemptChannelIds.length)
        return { ok: false, key: 'cmd.003.002.create.channels_invalid' };
    return validateDraft({
        name: sections[0],
        presets,
        allowList: splitValues(sections[2] ?? ''),
        customMessage: sections[3] || null,
        alertChannelId,
        timeoutMinutes: null,
        exemptRoleIds,
        exemptChannelIds,
        enabled: isEnabled(sections[7])
    });
}
function validateDraft(draft) {
    if (!draft.name || draft.name.length > 100) {
        return { ok: false, key: 'cmd.003.002.create.name_invalid' };
    }
    if (!draft.presets.length) {
        return { ok: false, key: 'cmd.003.002.preset.categories_required' };
    }
    if (draft.allowList.length > allowListLimit) {
        return { ok: false, key: 'cmd.003.002.preset.allow_limit', values: [allowListLimit] };
    }
    if (draft.allowList.some(value => value.length > termLength)) {
        return { ok: false, key: 'cmd.003.002.create.allow_length', values: [termLength] };
    }
    if (draft.customMessage && draft.customMessage.length > customMessageLength) {
        return { ok: false, key: 'cmd.003.002.create.message_length', values: [customMessageLength] };
    }
    if (draft.exemptRoleIds.length > exemptRoleLimit) {
        return { ok: false, key: 'cmd.003.002.create.roles_limit', values: [exemptRoleLimit] };
    }
    if (draft.exemptChannelIds.length > exemptChannelLimit) {
        return { ok: false, key: 'cmd.003.002.create.channels_limit', values: [exemptChannelLimit] };
    }
    return { ok: true, draft };
}
function presetRuleConflict(rules, draft, locale) {
    if (rules.some(rule => rule.name.toLocaleLowerCase() === draft.name.toLocaleLowerCase())) {
        return (0, config_1.text)(locale, 'cmd.003.002.create.duplicate_name');
    }
    const used = rules.filter(rule => rule.triggerType === discord_js_1.AutoModerationRuleTriggerType.KeywordPreset).size;
    const limit = automod_1.autoModRuleLimits[discord_js_1.AutoModerationRuleTriggerType.KeywordPreset];
    return used >= limit ? (0, config_1.text)(locale, 'cmd.003.002.preset.capacity', used, limit) : null;
}
function parsePrefixPresets(value) {
    const aliases = {
        '1': discord_js_1.AutoModerationRuleKeywordPresetType.Profanity,
        profanity: discord_js_1.AutoModerationRuleKeywordPresetType.Profanity,
        ofensivo: discord_js_1.AutoModerationRuleKeywordPresetType.Profanity,
        '2': discord_js_1.AutoModerationRuleKeywordPresetType.SexualContent,
        sexual: discord_js_1.AutoModerationRuleKeywordPresetType.SexualContent,
        'contenido-sexual': discord_js_1.AutoModerationRuleKeywordPresetType.SexualContent,
        '3': discord_js_1.AutoModerationRuleKeywordPresetType.Slurs,
        slurs: discord_js_1.AutoModerationRuleKeywordPresetType.Slurs,
        insultos: discord_js_1.AutoModerationRuleKeywordPresetType.Slurs,
        discriminatorio: discord_js_1.AutoModerationRuleKeywordPresetType.Slurs
    };
    const names = value.split(/[\s,]+/).map(name => name.toLocaleLowerCase()).filter(Boolean);
    if (!names.length || names.some(name => !(name in aliases)))
        return null;
    return [...new Set(names.map(name => aliases[name]))];
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
function isEnabled(value) {
    return ['true', 'on', 'active', 'activo', 'si', 'yes'].includes(value?.toLocaleLowerCase() ?? '');
}
function presetRulePreview(draft, locale) {
    const categories = draft.presets
        .map(preset => `• ${(0, config_1.text)(locale, `system.003.automod.preset.${preset}`)}`)
        .join('\n');
    return new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Blurple)
        .setTitle((0, config_1.text)(locale, 'cmd.003.002.preset.title'))
        .setDescription((0, config_1.text)(locale, 'cmd.003.002.create.preview'))
        .addFields({ name: (0, config_1.text)(locale, 'cmd.003.002.create.field.name'), value: (0, discord_js_1.escapeMarkdown)(draft.name) }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.create.field.state'),
        value: (0, config_1.text)(locale, draft.enabled ? 'cmd.003.002.rule.enabled' : 'cmd.003.002.rule.disabled'),
        inline: true
    }, { name: (0, config_1.text)(locale, 'cmd.003.002.preset.field.categories'), value: categories }, { name: (0, config_1.text)(locale, 'cmd.003.002.create.field.action'), value: (0, automod_create_1.formatAutoModActions)(draft, locale) }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.create.field.allowed', draft.allowList.length),
        value: draft.allowList.length
            ? formatValues(draft.allowList, 700)
            : (0, config_1.text)(locale, 'cmd.003.002.none')
    }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.create.field.message'),
        value: draft.customMessage ? (0, discord_js_1.escapeMarkdown)(draft.customMessage) : (0, config_1.text)(locale, 'cmd.003.002.none')
    }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.create.field.roles', draft.exemptRoleIds.length),
        value: draft.exemptRoleIds.length
            ? (0, automod_create_1.formatAutoModMentions)(draft.exemptRoleIds, 'role', 700)
            : (0, config_1.text)(locale, 'cmd.003.002.none')
    }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.create.field.channels', draft.exemptChannelIds.length),
        value: draft.exemptChannelIds.length
            ? (0, automod_create_1.formatAutoModMentions)(draft.exemptChannelIds, 'channel', 700)
            : (0, config_1.text)(locale, 'cmd.003.002.none')
    })
        .setFooter({ text: (0, config_1.text)(locale, 'cmd.003.002.create.expires') });
}
function formatValues(values, limit) {
    const formatted = values.map(value => (0, discord_js_1.inlineCode)(value)).join(', ');
    return formatted.length <= limit ? formatted : `${formatted.slice(0, limit - 3)}...`;
}
