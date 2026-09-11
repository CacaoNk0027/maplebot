"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestKeywordRuleCreation = requestKeywordRuleCreation;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const automod_1 = require("./automod");
const automod_create_1 = require("./automod_create");
const keywordLimit = 1_000;
const keywordLength = 60;
const allowListLimit = 100;
const regexLimit = 10;
const regexLength = 260;
const customMessageLength = 150;
const exemptRoleLimit = 20;
const exemptChannelLimit = 50;
const timeoutMinuteLimit = 40_320;
async function requestKeywordRuleCreation(target, rules, args, locale) {
    const parsed = keywordRuleDraft(target, args);
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
        customId: 'keyword',
        preview: keywordRulePreview(draft, locale),
        conflict: currentRules => keywordRuleConflict(currentRules, draft, locale),
        create: () => target.guild.autoModerationRules.create({
            name: draft.name,
            eventType: discord_js_1.AutoModerationRuleEventType.MessageSend,
            triggerType: discord_js_1.AutoModerationRuleTriggerType.Keyword,
            triggerMetadata: {
                keywordFilter: draft.keywords,
                regexPatterns: draft.regexPatterns,
                allowList: draft.allowList
            },
            actions: (0, automod_create_1.autoModRuleActions)(draft),
            exemptRoles: draft.exemptRoleIds,
            exemptChannels: draft.exemptChannelIds,
            enabled: draft.enabled,
            reason: (0, automod_create_1.autoModAuditReason)(target, 'AutoMod keyword rule created')
        })
    });
}
function keywordRuleDraft(target, args) {
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        return validateDraft({
            name: target.options.getString('name', true).trim(),
            keywords: splitValues(target.options.getString('keywords') ?? ''),
            regexPatterns: splitPatterns(target.options.getString('regex') ?? ''),
            allowList: splitValues(target.options.getString('allow-list') ?? ''),
            customMessage: target.options.getString('custom-message')?.trim() || null,
            alertChannelId: target.options.getChannel('alert-channel')?.id ?? null,
            timeoutMinutes: target.options.getInteger('timeout-minutes'),
            exemptRoleIds: (0, automod_create_1.splitSnowflakes)(target.options.getString('exempt-roles') ?? ''),
            exemptChannelIds: (0, automod_create_1.splitSnowflakes)(target.options.getString('exempt-channels') ?? ''),
            enabled: target.options.getBoolean('enabled') ?? false
        });
    }
    const sections = args.slice(1).join(' ').split('|').map(value => value.trim());
    if (sections.length < 2)
        return { ok: false, key: 'cmd.003.002.create.prefix_usage' };
    const alertChannelId = (0, automod_create_1.firstSnowflake)(sections[6] ?? '');
    const exemptRoleIds = (0, automod_create_1.splitSnowflakes)(sections[8] ?? '');
    const exemptChannelIds = (0, automod_create_1.splitSnowflakes)(sections[9] ?? '');
    if (sections[6] && !alertChannelId)
        return { ok: false, key: 'cmd.003.002.create.alert_invalid' };
    if (sections[8] && !exemptRoleIds.length)
        return { ok: false, key: 'cmd.003.002.create.roles_invalid' };
    if (sections[9] && !exemptChannelIds.length)
        return { ok: false, key: 'cmd.003.002.create.channels_invalid' };
    return validateDraft({
        name: sections[0],
        keywords: splitValues(sections[1]),
        regexPatterns: splitPatterns(sections[5] ?? ''),
        allowList: splitValues(sections[2] ?? ''),
        customMessage: sections[3] || null,
        alertChannelId,
        timeoutMinutes: (0, automod_create_1.parseOptionalInteger)(sections[7]),
        exemptRoleIds,
        exemptChannelIds,
        enabled: isEnabled(sections[4])
    });
}
function validateDraft(draft) {
    if (!draft.name || draft.name.length > 100) {
        return { ok: false, key: 'cmd.003.002.create.name_invalid' };
    }
    if (!draft.keywords.length && !draft.regexPatterns.length) {
        return { ok: false, key: 'cmd.003.002.create.patterns_required' };
    }
    if (draft.keywords.length > keywordLimit) {
        return { ok: false, key: 'cmd.003.002.create.keywords_limit', values: [keywordLimit] };
    }
    if (draft.keywords.some(value => value.length > keywordLength)) {
        return { ok: false, key: 'cmd.003.002.create.keyword_length', values: [keywordLength] };
    }
    if (draft.allowList.length > allowListLimit) {
        return { ok: false, key: 'cmd.003.002.create.allow_limit', values: [allowListLimit] };
    }
    if (draft.allowList.some(value => value.length > keywordLength)) {
        return { ok: false, key: 'cmd.003.002.create.allow_length', values: [keywordLength] };
    }
    if (draft.regexPatterns.length > regexLimit) {
        return { ok: false, key: 'cmd.003.002.create.regex_limit', values: [regexLimit] };
    }
    if (draft.regexPatterns.some(value => value.length > regexLength)) {
        return { ok: false, key: 'cmd.003.002.create.regex_length', values: [regexLength] };
    }
    if (draft.customMessage && draft.customMessage.length > customMessageLength) {
        return { ok: false, key: 'cmd.003.002.create.message_length', values: [customMessageLength] };
    }
    if (draft.timeoutMinutes !== null && (!Number.isInteger(draft.timeoutMinutes)
        || draft.timeoutMinutes < 1
        || draft.timeoutMinutes > timeoutMinuteLimit)) {
        return { ok: false, key: 'cmd.003.002.create.timeout_invalid', values: [timeoutMinuteLimit] };
    }
    if (draft.exemptRoleIds.length > exemptRoleLimit) {
        return { ok: false, key: 'cmd.003.002.create.roles_limit', values: [exemptRoleLimit] };
    }
    if (draft.exemptChannelIds.length > exemptChannelLimit) {
        return { ok: false, key: 'cmd.003.002.create.channels_limit', values: [exemptChannelLimit] };
    }
    return { ok: true, draft };
}
function keywordRuleConflict(rules, draft, locale) {
    if (rules.some(rule => rule.name.toLocaleLowerCase() === draft.name.toLocaleLowerCase())) {
        return (0, config_1.text)(locale, 'cmd.003.002.create.duplicate_name');
    }
    const used = rules.filter(rule => rule.triggerType === discord_js_1.AutoModerationRuleTriggerType.Keyword).size;
    const limit = automod_1.autoModRuleLimits[discord_js_1.AutoModerationRuleTriggerType.Keyword];
    return used >= limit ? (0, config_1.text)(locale, 'cmd.003.002.create.capacity', used, limit) : null;
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
function isEnabled(value) {
    return ['true', 'on', 'active', 'activo', 'si', 'yes'].includes(value?.toLocaleLowerCase() ?? '');
}
function keywordRulePreview(draft, locale) {
    return new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Blurple)
        .setTitle((0, config_1.text)(locale, 'cmd.003.002.create.title'))
        .setDescription((0, config_1.text)(locale, 'cmd.003.002.create.preview'))
        .addFields({ name: (0, config_1.text)(locale, 'cmd.003.002.create.field.name'), value: (0, discord_js_1.escapeMarkdown)(draft.name) }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.create.field.state'),
        value: (0, config_1.text)(locale, draft.enabled ? 'cmd.003.002.rule.enabled' : 'cmd.003.002.rule.disabled'),
        inline: true
    }, { name: (0, config_1.text)(locale, 'cmd.003.002.create.field.action'), value: (0, automod_create_1.formatAutoModActions)(draft, locale) }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.create.field.keywords', draft.keywords.length),
        value: draft.keywords.length ? formatValues(draft.keywords, 700) : (0, config_1.text)(locale, 'cmd.003.002.none')
    }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.create.field.regex', draft.regexPatterns.length),
        value: draft.regexPatterns.length
            ? formatValues(draft.regexPatterns, 700)
            : (0, config_1.text)(locale, 'cmd.003.002.none')
    }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.create.field.allowed', draft.allowList.length),
        value: draft.allowList.length ? formatValues(draft.allowList, 700) : (0, config_1.text)(locale, 'cmd.003.002.none')
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
