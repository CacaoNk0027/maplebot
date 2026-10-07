"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderationLocale = moderationLocale;
exports.ensureModerationPermissions = ensureModerationPermissions;
exports.resolveGuildMember = resolveGuildMember;
exports.resolveGuildRole = resolveGuildRole;
exports.resolveGuildChannel = resolveGuildChannel;
exports.validateTargetMember = validateTargetMember;
exports.validateAssignableRole = validateAssignableRole;
exports.readModerationReason = readModerationReason;
exports.recordManualInfraction = recordManualInfraction;
exports.remainingArguments = remainingArguments;
exports.memberDisplayName = memberDisplayName;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const Infraction_1 = __importDefault(require("../../shared/bot/models/Infraction"));
const MODERATION_REASON_LIMIT = 400;
async function moderationLocale(target) {
    return await (0, config_1._locale)(target.guild);
}
async function ensureModerationPermissions(target, locale, userPermissions, botPermissions) {
    const guild = target.guild;
    if (!guild) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.guild_only'), true);
        return false;
    }
    const [actor, bot] = await Promise.all([
        guild.members.fetch(target instanceof discord_js_1.Message ? target.author.id : target.user.id),
        guild.members.fetchMe()
    ]);
    const missingUserPermissions = userPermissions.filter(permission => !actor.permissions.has(permission));
    if (missingUserPermissions.length) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.permissions.user', missingUserPermissions.join(', ')), true);
        return false;
    }
    const missingBotPermissions = botPermissions.filter(permission => !bot.permissions.has(permission));
    if (missingBotPermissions.length) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.permissions.bot', missingBotPermissions.join(', ')), true);
        return false;
    }
    return true;
}
async function resolveGuildMember(target, args = []) {
    const guild = target.guild;
    if (!guild)
        return null;
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        const user = target.options.getUser('user');
        if (!user)
            return null;
        const member = await guild.members.fetch(user.id).catch(() => null);
        return member ? { member, consumedArgument: null } : null;
    }
    const mentioned = target.mentions.members?.first();
    if (mentioned) {
        const consumedArgument = args.findIndex(argument => extractSnowflake(argument) === mentioned.id);
        return { member: mentioned, consumedArgument: consumedArgument >= 0 ? consumedArgument : null };
    }
    for (let index = 0; index < args.length; index++) {
        const id = extractSnowflake(args[index]);
        if (!id)
            continue;
        const member = await guild.members.fetch(id).catch(() => null);
        if (member)
            return { member, consumedArgument: index };
    }
    if (target.reference?.messageId) {
        const referenced = await target.channel.messages.fetch(target.reference.messageId).catch(() => null);
        if (referenced?.member)
            return { member: referenced.member, consumedArgument: null };
    }
    return null;
}
async function resolveGuildRole(target, args = [], excludedIds = []) {
    const guild = target.guild;
    if (!guild)
        return null;
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        const role = target.options.getRole('role');
        return role ? await guild.roles.fetch(role.id).catch(() => null) : null;
    }
    const mentioned = target.mentions.roles.first();
    if (mentioned?.guild.id === guild.id)
        return mentioned;
    for (const argument of args) {
        const id = extractSnowflake(argument);
        if (!id || excludedIds.includes(id))
            continue;
        const role = await guild.roles.fetch(id).catch(() => null);
        if (role)
            return role;
    }
    return null;
}
async function resolveGuildChannel(target, args = []) {
    const guild = target.guild;
    if (!guild)
        return null;
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        const selected = target.options.getChannel('channel');
        if (selected)
            return await guild.channels.fetch(selected.id).catch(() => null);
        return target.channel?.isDMBased() ? null : target.channel;
    }
    const mentioned = target.mentions.channels.first();
    if (mentioned)
        return await guild.channels.fetch(mentioned.id).catch(() => null);
    if (args.length) {
        const id = args.map(extractSnowflake).find((value) => Boolean(value));
        if (!id)
            return null;
        return await guild.channels.fetch(id).catch(() => null);
    }
    return target.channel.isDMBased() ? null : target.channel;
}
async function validateTargetMember(target, member, locale, action) {
    const guild = target.guild;
    if (!guild)
        return false;
    const actor = await guild.members.fetch(target instanceof discord_js_1.Message ? target.author.id : target.user.id);
    if (member.id === actor.id) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.member.self'), true);
        return false;
    }
    if (member.id === target.client.user?.id) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.member.client'), true);
        return false;
    }
    if (member.id === guild.ownerId) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.member.owner'), true);
        return false;
    }
    // Expulsar un bot es un uso legítimo (quitar uno no deseado); avisarlo o
    // aislarlo no tiene sentido.
    if (member.user.bot && action !== 'kick') {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.member.bot'), true);
        return false;
    }
    if (actor.id !== guild.ownerId
        && actor.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.member.hierarchy'), true);
        return false;
    }
    // Un aviso no requiere que el bot actúe sobre el miembro.
    const botCanAct = action === 'timeout' ? member.moderatable
        : action === 'kick' ? member.kickable
            : action === 'roles' ? member.manageable
                : true;
    if (!botCanAct) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, `system.003.member.${action}.unavailable`), true);
        return false;
    }
    return true;
}
async function validateAssignableRole(target, role, locale) {
    const guild = target.guild;
    if (!guild || role.guild.id !== guild.id) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.role.invalid'), true);
        return false;
    }
    if (role.id === guild.roles.everyone.id || role.managed) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.role.managed'), true);
        return false;
    }
    const [actor, bot] = await Promise.all([
        guild.members.fetch(target instanceof discord_js_1.Message ? target.author.id : target.user.id),
        guild.members.fetchMe()
    ]);
    if (bot.roles.highest.comparePositionTo(role) <= 0) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.role.bot_hierarchy'), true);
        return false;
    }
    if (actor.id !== guild.ownerId && actor.roles.highest.comparePositionTo(role) <= 0) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.role.user_hierarchy'), true);
        return false;
    }
    return true;
}
/**
 * Lee el motivo de una sanción: la opción `reason` por slash, o los argumentos
 * que sobran tras el objetivo por prefijo. Devuelve null si excede el límite.
 */
async function readModerationReason(target, args, consumedArgument, locale) {
    const raw = target instanceof discord_js_1.ChatInputCommandInteraction
        ? target.options.getString('reason')
        : remainingArguments(args, consumedArgument).join(' ');
    const reason = raw?.trim() || (0, config_1.text)(locale, 'system.003.reason.default');
    if (reason.length > MODERATION_REASON_LIMIT) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.reason.too_long'), true);
        return null;
    }
    return reason;
}
/**
 * Deja una sanción manual en el historial. Es el mismo registro que usa
 * AutoMod, distinguido por `source`, así que cuenta para el escalado.
 */
async function recordManualInfraction(guildId, userId, moderatorId, action, reason) {
    try {
        await Infraction_1.default.record({ guildId, userId, source: 'manual', moderatorId, action, reason });
        return true;
    }
    catch (error) {
        console.error('[Moderation:ERR] No se pudo registrar la sanción en el historial:', error);
        return false;
    }
}
function remainingArguments(args = [], consumedArgument) {
    return consumedArgument === null
        ? [...args]
        : args.filter((_, index) => index !== consumedArgument);
}
function memberDisplayName(member) {
    return member.nickname ?? member.user.globalName ?? member.user.username;
}
function extractSnowflake(value) {
    if (!value)
        return null;
    const match = value.match(/\d{16,22}/);
    return match?.[0] ?? null;
}
