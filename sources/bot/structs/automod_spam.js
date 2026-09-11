"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestSpamRuleCreation = requestSpamRuleCreation;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const automod_1 = require("./automod");
const automod_create_1 = require("./automod_create");
const customMessageLength = 150;
const exemptRoleLimit = 20;
const exemptChannelLimit = 50;
async function requestSpamRuleCreation(target, rules, args, locale) {
    const parsed = spamRuleDraft(target, args);
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
        customId: 'spam',
        preview: spamRulePreview(draft, locale),
        conflict: currentRules => spamRuleConflict(currentRules, draft, locale),
        create: () => target.guild.autoModerationRules.create({
            name: draft.name,
            eventType: discord_js_1.AutoModerationRuleEventType.MessageSend,
            triggerType: discord_js_1.AutoModerationRuleTriggerType.Spam,
            actions: (0, automod_create_1.autoModRuleActions)(draft),
            exemptRoles: draft.exemptRoleIds,
            exemptChannels: draft.exemptChannelIds,
            enabled: draft.enabled,
            reason: (0, automod_create_1.autoModAuditReason)(target, 'AutoMod generic spam rule created')
        })
    });
}
function spamRuleDraft(target, args) {
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        return validateDraft({
            name: target.options.getString('name', true).trim(),
            customMessage: target.options.getString('custom-message')?.trim() || null,
            alertChannelId: target.options.getChannel('alert-channel')?.id ?? null,
            timeoutMinutes: null,
            exemptRoleIds: (0, automod_create_1.splitSnowflakes)(target.options.getString('exempt-roles') ?? ''),
            exemptChannelIds: (0, automod_create_1.splitSnowflakes)(target.options.getString('exempt-channels') ?? ''),
            enabled: target.options.getBoolean('enabled') ?? false
        });
    }
    const sections = args.slice(1).join(' ').split('|').map(value => value.trim());
    if (!sections[0])
        return { ok: false, key: 'cmd.003.002.spam.prefix_usage' };
    const alertChannelId = (0, automod_create_1.firstSnowflake)(sections[2] ?? '');
    const exemptRoleIds = (0, automod_create_1.splitSnowflakes)(sections[3] ?? '');
    const exemptChannelIds = (0, automod_create_1.splitSnowflakes)(sections[4] ?? '');
    if (sections[2] && !alertChannelId)
        return { ok: false, key: 'cmd.003.002.create.alert_invalid' };
    if (sections[3] && !exemptRoleIds.length)
        return { ok: false, key: 'cmd.003.002.create.roles_invalid' };
    if (sections[4] && !exemptChannelIds.length)
        return { ok: false, key: 'cmd.003.002.create.channels_invalid' };
    return validateDraft({
        name: sections[0],
        customMessage: sections[1] || null,
        alertChannelId,
        timeoutMinutes: null,
        exemptRoleIds,
        exemptChannelIds,
        enabled: isEnabled(sections[5])
    });
}
function validateDraft(draft) {
    if (!draft.name || draft.name.length > 100) {
        return { ok: false, key: 'cmd.003.002.create.name_invalid' };
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
function spamRuleConflict(rules, draft, locale) {
    if (rules.some(rule => rule.name.toLocaleLowerCase() === draft.name.toLocaleLowerCase())) {
        return (0, config_1.text)(locale, 'cmd.003.002.create.duplicate_name');
    }
    const used = rules.filter(rule => rule.triggerType === discord_js_1.AutoModerationRuleTriggerType.Spam).size;
    const limit = automod_1.autoModRuleLimits[discord_js_1.AutoModerationRuleTriggerType.Spam];
    return used >= limit ? (0, config_1.text)(locale, 'cmd.003.002.spam.capacity', used, limit) : null;
}
function spamRulePreview(draft, locale) {
    return new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Blurple)
        .setTitle((0, config_1.text)(locale, 'cmd.003.002.spam.title'))
        .setDescription((0, config_1.text)(locale, 'cmd.003.002.spam.preview'))
        .addFields({ name: (0, config_1.text)(locale, 'cmd.003.002.create.field.name'), value: (0, discord_js_1.escapeMarkdown)(draft.name) }, {
        name: (0, config_1.text)(locale, 'cmd.003.002.create.field.state'),
        value: (0, config_1.text)(locale, draft.enabled ? 'cmd.003.002.rule.enabled' : 'cmd.003.002.rule.disabled'),
        inline: true
    }, { name: (0, config_1.text)(locale, 'cmd.003.002.create.field.action'), value: (0, automod_create_1.formatAutoModActions)(draft, locale) }, {
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
function isEnabled(value) {
    return ['true', 'on', 'active', 'activo', 'si', 'yes'].includes(value?.toLocaleLowerCase() ?? '');
}
