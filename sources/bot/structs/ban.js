"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_DELETE_DAYS = void 0;
exports.banUser = banUser;
exports.unbanUser = unbanUser;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const moderation_1 = require("./moderation");
/** Discord solo permite borrar mensajes de los últimos 7 días al banear. */
const MAX_DELETE_DAYS = 7;
exports.MAX_DELETE_DAYS = MAX_DELETE_DAYS;
const DEFAULT_SOFTBAN_DAYS = 1;
const REASON_LIMIT = 400;
async function banUser(target, args, mode) {
    const locale = await (0, moderation_1.moderationLocale)(target);
    if (!await (0, moderation_1.ensureModerationPermissions)(target, locale, ['BanMembers'], ['BanMembers']))
        return;
    const guild = target.guild;
    const user = await resolveTargetUser(target, args);
    if (!user) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.011.user_required'), true);
        return;
    }
    if (!await canModerate(target, guild, user, locale))
        return;
    const existing = await guild.bans.fetch(user.id).catch(() => null);
    if (existing && mode === 'ban') {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.011.already_banned'), true);
        return;
    }
    const options = await parseOptions(target, args, locale, mode);
    if (!options)
        return;
    const actor = target instanceof discord_js_1.Message ? target.author : target.user;
    const auditReason = `${mode === 'softban' ? 'Softban' : 'Ban'} by ${actor.tag} (${actor.id}) | ${options.reason}`
        .slice(0, 512);
    try {
        await guild.bans.create(user.id, {
            deleteMessageSeconds: options.deleteDays * 86_400,
            reason: auditReason
        });
        // El softban existe solo para purgar mensajes: se revierte de inmediato
        // para que el usuario pueda volver a entrar.
        if (mode === 'softban') {
            await guild.bans.remove(user.id, auditReason);
        }
        await (0, moderation_1.recordManualInfraction)(guild.id, user.id, actor.id, mode, options.reason);
        await target.reply({
            embeds: [{
                    color: discord_js_1.Colors.Green,
                    description: (0, config_1.reply)('ok', (0, config_1.text)(locale, mode === 'softban' ? 'cmd.003.011.softban_success' : 'cmd.003.011.ban_success', user.tag))
                }]
        });
    }
    catch (error) {
        console.error(`[CommandBan:ERR] No se pudo aplicar el ${mode}:`, error);
        await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
async function unbanUser(target, args) {
    const locale = await (0, moderation_1.moderationLocale)(target);
    if (!await (0, moderation_1.ensureModerationPermissions)(target, locale, ['BanMembers'], ['BanMembers']))
        return;
    const guild = target.guild;
    const userId = target instanceof discord_js_1.ChatInputCommandInteraction
        ? target.options.getString('user')?.match(/\d{16,22}/)?.[0] ?? null
        : args.map(extractSnowflake).find((value) => Boolean(value)) ?? null;
    if (!userId) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.011.id_required'), true);
        return;
    }
    const existing = await guild.bans.fetch(userId).catch(() => null);
    if (!existing) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.011.not_banned'), true);
        return;
    }
    const actor = target instanceof discord_js_1.Message ? target.author : target.user;
    try {
        await guild.bans.remove(userId, `Unban by ${actor.tag} (${actor.id})`.slice(0, 512));
        await target.reply({
            embeds: [{
                    color: discord_js_1.Colors.Green,
                    description: (0, config_1.reply)('ok', (0, config_1.text)(locale, 'cmd.003.011.unban_success', existing.user.tag))
                }]
        });
    }
    catch (error) {
        console.error('[CommandBan:ERR] No se pudo retirar el baneo:', error);
        await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
/**
 * Resuelve al objetivo aceptando menciones, IDs sueltos o la opción de slash.
 *
 * Se resuelve como usuario y no como miembro a propósito: banear por ID a
 * alguien que no está en el servidor es uno de los casos que justifican el
 * comando.
 */
async function resolveTargetUser(target, args) {
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        const raw = target.options.getString('user');
        const id = raw?.match(/\d{16,22}/)?.[0];
        if (!id)
            return null;
        return await target.client.users.fetch(id).catch(() => null);
    }
    const mentioned = target.mentions.users.first();
    if (mentioned)
        return mentioned;
    const id = args.map(extractSnowflake).find((value) => Boolean(value));
    if (!id)
        return null;
    return await target.client.users.fetch(id).catch(() => null);
}
async function canModerate(target, guild, user, locale) {
    const actor = target instanceof discord_js_1.Message ? target.author : target.user;
    if (user.id === actor.id) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.member.self'), true);
        return false;
    }
    if (user.id === guild.client.user?.id) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.member.client'), true);
        return false;
    }
    if (user.id === guild.ownerId) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.member.owner'), true);
        return false;
    }
    // Solo hay jerarquía que comprobar si el objetivo sigue en el servidor.
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member)
        return true;
    const author = await guild.members.fetch(actor.id).catch(() => null);
    if (author
        && author.id !== guild.ownerId
        && author.roles.highest.comparePositionTo(member.roles.highest) <= 0) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.member.hierarchy'), true);
        return false;
    }
    if (!member.bannable) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.011.not_bannable'), true);
        return false;
    }
    return true;
}
async function parseOptions(target, args, locale, mode) {
    const fallbackDays = mode === 'softban' ? DEFAULT_SOFTBAN_DAYS : 0;
    let deleteDays = fallbackDays;
    let reason = (0, config_1.text)(locale, 'system.003.reason.default');
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        deleteDays = target.options.getInteger('days') ?? fallbackDays;
        reason = target.options.getString('reason')?.trim() || reason;
    }
    else {
        const remaining = args.filter(argument => !extractSnowflake(argument));
        if (remaining.length && /^\d$/.test(remaining[0])) {
            deleteDays = Number(remaining.shift());
        }
        reason = remaining.join(' ').trim() || reason;
    }
    if (deleteDays < 0 || deleteDays > MAX_DELETE_DAYS) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.011.days_invalid', MAX_DELETE_DAYS), true);
        return null;
    }
    if (reason.length > REASON_LIMIT) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.reason.too_long'), true);
        return null;
    }
    return { deleteDays, reason };
}
function extractSnowflake(value) {
    if (!value)
        return null;
    return value.match(/\d{16,22}/)?.[0] ?? null;
}
