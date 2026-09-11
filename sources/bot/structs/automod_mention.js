"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestMentionRuleCreation = requestMentionRuleCreation;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const automod_1 = require("./automod");
const automod_create_1 = require("./automod_create");
const mentionLimitMaximum = 50;
const customMessageLength = 150;
const exemptRoleLimit = 20;
const exemptChannelLimit = 50;
const timeoutMinuteLimit = 40_320;
async function requestMentionRuleCreation(target, rules, args, locale) {
    const parsed = mentionRuleDraft(target, args);
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
        customId: 'mention',
        preview: mentionRulePreview(draft, locale),
        conflict: currentRules => mentionRuleConflict(currentRules, draft, locale),
        create: () => target.guild.autoModerationRules.create({
            name: draft.name,
            eventType: discord_js_1.AutoModerationRuleEventType.MessageSend,
            triggerType: discord_js_1.AutoModerationRuleTriggerType.MentionSpam,
            triggerMetadata: {
                mentionTotalLimit: draft.mentionLimit,
                mentionRaidProtectionEnabled: draft.raidProtectionEnabled
            },
            actions: (0, automod_create_1.autoModRuleActions)(draft),
            exemptRoles: draft.exemptRoleIds,
            exemptChannels: draft.exemptChannelIds,
            enabled: draft.enabled,
            reason: (0, automod_create_1.autoModAuditReason)(target, 'AutoMod mention spam rule created')
        })
    });
}
function mentionRuleDraft(target, args) {
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        return validateDraft({
            name: target.options.getString('name', true).trim(),
            mentionLimit: target.options.getInteger('mention-limit', true),
            raidProtectionEnabled: target.options.getBoolean('raid-protection') ?? false,
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
        return { ok: false, key: 'cmd.003.002.mention.prefix_usage' };
    const alertChannelId = (0, automod_create_1.firstSnowflake)(sections[4] ?? '');
    const exemptRoleIds = (0, automod_create_1.splitSnowflakes)(sections[6] ?? '');
    const exemptChannelIds = (0, automod_create_1.splitSnowflakes)(sections[7] ?? '');
    if (sections[4] && !alertChannelId)
        return { ok: false, key: 'cmd.003.002.create.alert_invalid' };
    if (sections[6] && !exemptRoleIds.length)
        return { ok: false, key: 'cmd.003.002.create.roles_invalid' };
    if (sections[7] && !exemptChannelIds.length)
        return { ok: false, key: 'cmd.003.002.create.channels_invalid' };
    return validateDraft({
        name: sections[0],
        mentionLimit: Number(sections[1]),
        raidProtectionEnabled: ['true', 'on', 'active', 'activo', 'si', 'yes'].includes(sections[2]?.toLocaleLowerCase() ?? ''),
        customMessage: sections[3] || null,
        alertChannelId,
        timeoutMinutes: (0, automod_create_1.parseOptionalInteger)(sections[5]),
        exemptRoleIds,
        exemptChannelIds,
        enabled: ['true', 'on', 'active', 'activo', 'si', 'yes'].includes(sections[8]?.toLocaleLowerCase() ?? '')
    });
}
function validateDraft(draft) {
    if (!draft.name || draft.name.length > 100) {
        return { ok: false, key: 'cmd.003.002.create.name_invalid' };
    }
    if (!Number.isInteger(draft.mentionLimit) || draft.mentionLimit < 1 || draft.mentionLimit > mentionLimitMaximum) {
        return { ok: false, key: 'cmd.003.002.mention.limit_invalid', values: [mentionLimitMaximum] };
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
function mentionRuleConflict(rules, draft, locale) {
    if (rules.some(rule => rule.name.toLocaleLowerCase() === draft.name.toLocaleLowerCase())) {
        return (0, config_1.text)(locale, 'cmd.003.002.create.duplicate_name');
    }
    const used = rules.filter(rule => rule.triggerType === discord_js_1.AutoModerationRuleTriggerType.MentionSpam).size;
    const limit = automod_1.autoModRuleLimits[discord_js_1.AutoModerationRuleTriggerType.MentionSpam];
    return used >= limit ? (0, config_1.text)(locale, 'cmd.003.002.mention.capacity', used, limit) : null;
}
function mentionRulePreview(draft, locale) {
    return new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Blurple)
        .setTitle((0, config_1.text)(locale, 'cmd.003.002.mention.title'))
        .setDescription((0, config_1.text)(locale, 'cmd.003.002.create.preview'))
        .addFields({ name: (0, config_1.text)(locale, 'cmd.003.002.create.field.name'), value: (0, discord_js_1.escapeMarkdown)(draft.name) }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.create.field.state'),
        value: (0, config_1.text)(locale, draft.enabled ? 'cmd.003.002.rule.enabled' : 'cmd.003.002.rule.disabled'),
        inline: true
    }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.mention.field.limit'),
        value: String(draft.mentionLimit),
        inline: true
    }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.mention.field.raid'),
        value: (0, config_1.text)(locale, draft.raidProtectionEnabled ? 'cmd.003.002.yes' : 'cmd.003.002.no'),
        inline: true
    }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.create.field.action'),
        value: (0, automod_create_1.formatAutoModActions)(draft, locale)
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
