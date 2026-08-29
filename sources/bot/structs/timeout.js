"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMemberTimeout = setMemberTimeout;
const discord_js_1 = require("discord.js");
const ms_1 = __importDefault(require("ms"));
const config_1 = require("../config/config");
const moderation_1 = require("./moderation");
const DEFAULT_DURATION = (0, ms_1.default)('10m');
const MIN_DURATION = (0, ms_1.default)('60s');
const MAX_DURATION = (0, ms_1.default)('28d');
async function setMemberTimeout(target, args = [], remove) {
    const locale = await (0, moderation_1.moderationLocale)(target);
    if (!await (0, moderation_1.ensureModerationPermissions)(target, locale, ['ModerateMembers'], ['ModerateMembers']))
        return;
    const resolved = await (0, moderation_1.resolveGuildMember)(target, args);
    if (!resolved) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.member.required'), true);
        return;
    }
    if (!await (0, moderation_1.validateTargetMember)(target, resolved.member, locale, 'timeout'))
        return;
    if (!remove && resolved.member.isCommunicationDisabled()) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.004.already_muted'), true);
        return;
    }
    const parsed = await parseOptions(target, (0, moderation_1.remainingArguments)(args, resolved.consumedArgument), locale, remove);
    if (!parsed)
        return;
    if (remove && !resolved.member.isCommunicationDisabled()) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.005.not_muted'), true);
        return;
    }
    const actor = target instanceof discord_js_1.Message ? target.author : target.user;
    const action = remove ? 'Timeout removed' : 'Timeout applied';
    const auditReason = `${action} by ${actor.tag} (${actor.id}) | ${parsed.reason}`.slice(0, 512);
    try {
        await resolved.member.timeout(remove ? null : parsed.duration, auditReason);
        await target.reply({
            embeds: [{
                    color: discord_js_1.Colors.Green,
                    description: (0, config_1.reply)('ok', (0, config_1.text)(locale, remove ? 'cmd.003.005.success' : 'cmd.003.004.success', (0, moderation_1.memberDisplayName)(resolved.member)))
                }]
        });
    }
    catch (error) {
        console.error(`[CommandTimeout:ERR] No se pudo ${remove ? 'remover' : 'aplicar'} el aislamiento:`, error);
        await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
async function parseOptions(target, args, locale, remove) {
    let duration = DEFAULT_DURATION;
    let reason = (0, config_1.text)(locale, 'system.003.reason.default');
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        if (!remove) {
            const rawDuration = target.options.getString('time') ?? '10m';
            const parsedDuration = parseDuration(rawDuration);
            if (parsedDuration === null) {
                await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.time.invalid'), true);
                return null;
            }
            duration = parsedDuration;
        }
        reason = target.options.getString('reason')?.trim() || reason;
    }
    else {
        const remaining = [...args];
        if (!remove && remaining.length && looksLikeDuration(remaining[0])) {
            const parsedDuration = parseDuration(remaining.shift());
            if (parsedDuration === null) {
                await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.time.invalid'), true);
                return null;
            }
            duration = parsedDuration;
        }
        reason = remaining.join(' ').trim() || reason;
    }
    if (!remove && (duration < MIN_DURATION || duration > MAX_DURATION)) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.time.range'), true);
        return null;
    }
    if (reason.length > 400) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.reason.too_long'), true);
        return null;
    }
    return { duration, reason };
}
function parseDuration(value) {
    if (!/^\d+(?:\.\d+)?[smhdw]$/i.test(value))
        return null;
    const duration = (0, ms_1.default)(value);
    return typeof duration === 'number' && Number.isFinite(duration) ? duration : null;
}
function looksLikeDuration(value) {
    return /^\d/.test(value);
}
