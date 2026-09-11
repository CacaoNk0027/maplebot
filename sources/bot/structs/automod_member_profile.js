"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestMemberProfileRuleCreation = requestMemberProfileRuleCreation;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const automod_1 = require("./automod");
const automod_create_1 = require("./automod_create");
const keywordLimit = 1_000;
const keywordLength = 60;
const allowListLimit = 100;
const regexLimit = 10;
const regexLength = 260;
const exemptRoleLimit = 20;
async function requestMemberProfileRuleCreation(target, rules, args, locale) {
    const parsed = memberProfileRuleDraft(target, args);
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
        customId: 'member-profile',
        preview: memberProfileRulePreview(draft, locale),
        conflict: currentRules => memberProfileRuleConflict(currentRules, draft, locale),
        create: () => target.guild.autoModerationRules.create({
            name: draft.name,
            // El perfil se evalúa al actualizarse el miembro, no al enviar mensajes.
            eventType: discord_js_1.AutoModerationRuleEventType.MemberUpdate,
            triggerType: discord_js_1.AutoModerationRuleTriggerType.MemberProfile,
            triggerMetadata: {
                keywordFilter: draft.keywords,
                regexPatterns: draft.regexPatterns,
                allowList: draft.allowList
            },
            // Es la única acción que Discord admite para este disparador: ni
            // bloqueo de mensaje, ni alerta, ni aislamiento.
            actions: [{ type: discord_js_1.AutoModerationActionType.BlockMemberInteraction }],
            exemptRoles: draft.exemptRoleIds,
            enabled: draft.enabled,
            reason: (0, automod_create_1.autoModAuditReason)(target, 'AutoMod member profile rule created')
        })
    });
}
function memberProfileRuleDraft(target, args) {
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        return validateDraft({
            name: target.options.getString('name', true).trim(),
            keywords: splitValues(target.options.getString('keywords') ?? ''),
            regexPatterns: splitPatterns(target.options.getString('regex') ?? ''),
            allowList: splitValues(target.options.getString('allow-list') ?? ''),
            customMessage: null,
            alertChannelId: null,
            timeoutMinutes: null,
            exemptRoleIds: (0, automod_create_1.splitSnowflakes)(target.options.getString('exempt-roles') ?? ''),
            exemptChannelIds: [],
            enabled: target.options.getBoolean('enabled') ?? false
        });
    }
    const sections = args.slice(1).join(' ').split('|').map(value => value.trim());
    if (sections.length < 2)
        return { ok: false, key: 'cmd.003.002.create.prefix_usage' };
    const exemptRoleIds = (0, automod_create_1.splitSnowflakes)(sections[4] ?? '');
    if (sections[4] && !exemptRoleIds.length)
        return { ok: false, key: 'cmd.003.002.create.roles_invalid' };
    return validateDraft({
        name: sections[0],
        keywords: splitValues(sections[1]),
        regexPatterns: splitPatterns(sections[3] ?? ''),
        allowList: splitValues(sections[2] ?? ''),
        customMessage: null,
        alertChannelId: null,
        timeoutMinutes: null,
        exemptRoleIds,
        exemptChannelIds: [],
        enabled: isEnabled(sections[5])
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
    if (draft.exemptRoleIds.length > exemptRoleLimit) {
        return { ok: false, key: 'cmd.003.002.create.roles_limit', values: [exemptRoleLimit] };
    }
    return { ok: true, draft };
}
function memberProfileRuleConflict(rules, draft, locale) {
    if (rules.some(rule => rule.name.toLocaleLowerCase() === draft.name.toLocaleLowerCase())) {
        return (0, config_1.text)(locale, 'cmd.003.002.create.duplicate_name');
    }
    const used = rules.filter(rule => rule.triggerType === discord_js_1.AutoModerationRuleTriggerType.MemberProfile).size;
    const limit = automod_1.autoModRuleLimits[discord_js_1.AutoModerationRuleTriggerType.MemberProfile];
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
function memberProfileRulePreview(draft, locale) {
    return new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Blurple)
        .setTitle((0, config_1.text)(locale, 'cmd.003.002.create.title'))
        .setDescription((0, config_1.text)(locale, 'cmd.003.002.member_profile.preview'))
        .addFields({ name: (0, config_1.text)(locale, 'cmd.003.002.create.field.name'), value: (0, discord_js_1.escapeMarkdown)(draft.name) }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.create.field.state'),
        value: (0, config_1.text)(locale, draft.enabled ? 'cmd.003.002.rule.enabled' : 'cmd.003.002.rule.disabled'),
        inline: true
    }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.create.field.action'),
        value: `• ${(0, config_1.text)(locale, 'system.003.automod.action.4')}`
    }, {
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
        name: (0, config_1.text)(locale, 'cmd.003.002.create.field.roles', draft.exemptRoleIds.length),
        value: draft.exemptRoleIds.length
            ? (0, automod_create_1.formatAutoModMentions)(draft.exemptRoleIds, 'role', 700)
            : (0, config_1.text)(locale, 'cmd.003.002.none')
    })
        .setFooter({ text: (0, config_1.text)(locale, 'cmd.003.002.create.expires') });
}
function formatValues(values, limit) {
    const formatted = values.map(value => (0, discord_js_1.inlineCode)(value)).join(', ');
    return formatted.length <= limit ? formatted : `${formatted.slice(0, limit - 3)}...`;
}
