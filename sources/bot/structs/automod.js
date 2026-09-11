"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoModRuleLimits = void 0;
exports.fetchAutoModRules = fetchAutoModRules;
exports.fetchAutoModRule = fetchAutoModRule;
exports.resolveAutoModRule = resolveAutoModRule;
exports.countAutoModRulesByTrigger = countAutoModRulesByTrigger;
exports.autoModTriggerKey = autoModTriggerKey;
exports.autoModActionKey = autoModActionKey;
const discord_js_1 = require("discord.js");
exports.autoModRuleLimits = {
    [discord_js_1.AutoModerationRuleTriggerType.Keyword]: 6,
    [discord_js_1.AutoModerationRuleTriggerType.Spam]: 1,
    [discord_js_1.AutoModerationRuleTriggerType.KeywordPreset]: 1,
    [discord_js_1.AutoModerationRuleTriggerType.MentionSpam]: 1,
    [discord_js_1.AutoModerationRuleTriggerType.MemberProfile]: 1
};
async function fetchAutoModRules(guild) {
    return await guild.autoModerationRules.fetch();
}
async function fetchAutoModRule(guild, ruleId) {
    return guild.autoModerationRules.cache.get(ruleId)
        ?? await guild.autoModerationRules.fetch(ruleId).catch(() => null);
}
function resolveAutoModRule(rules, identifier) {
    const normalized = identifier.trim().toLocaleLowerCase();
    if (!normalized)
        return { status: 'missing' };
    const byId = rules.get(normalized);
    if (byId)
        return { status: 'found', rule: byId };
    const byName = rules.filter(rule => rule.name.toLocaleLowerCase() === normalized);
    if (byName.size > 1)
        return { status: 'ambiguous' };
    const rule = byName.first();
    return rule ? { status: 'found', rule } : { status: 'missing' };
}
function countAutoModRulesByTrigger(rules) {
    const counts = new Map();
    for (const rule of rules.values()) {
        counts.set(rule.triggerType, (counts.get(rule.triggerType) ?? 0) + 1);
    }
    return counts;
}
function autoModTriggerKey(trigger) {
    return `system.003.automod.trigger.${trigger}`;
}
function autoModActionKey(action) {
    return `system.003.automod.action.${action}`;
}
