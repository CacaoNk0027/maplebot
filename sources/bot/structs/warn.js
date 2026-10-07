"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.warnMember = warnMember;
exports.removeLastWarning = removeLastWarning;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const Infraction_1 = __importDefault(require("../../shared/bot/models/Infraction"));
const automod_escalation_1 = require("./automod_escalation");
const moderation_1 = require("./moderation");
/**
 * Registra un aviso en el historial y evalúa el escalado.
 *
 * Maple no envía mensajes directos (top.gg penaliza a los bots que lo hacen),
 * así que el aviso llega al usuario mencionándolo en el canal donde se invoca.
 */
async function warnMember(target, args = []) {
    const locale = await (0, moderation_1.moderationLocale)(target);
    if (!await (0, moderation_1.ensureModerationPermissions)(target, locale, ['ModerateMembers'], []))
        return;
    const resolved = await (0, moderation_1.resolveGuildMember)(target, args);
    if (!resolved) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.member.required'), true);
        return;
    }
    const { member, consumedArgument } = resolved;
    if (!await (0, moderation_1.validateTargetMember)(target, member, locale, 'warn'))
        return;
    const reason = await (0, moderation_1.readModerationReason)(target, args, consumedArgument, locale);
    if (reason === null)
        return;
    const actor = target instanceof discord_js_1.Message ? target.author : target.user;
    // El aviso es el propio registro: si no se guarda, no hay aviso.
    const recorded = await (0, moderation_1.recordManualInfraction)(member.guild.id, member.id, actor.id, 'warn', reason);
    if (!recorded) {
        await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
        return;
    }
    try {
        const warnings = await Infraction_1.default.countWarnings(member.guild.id, member.id);
        await target.reply({
            content: `<@${member.id}>`,
            allowedMentions: { users: [member.id] },
            embeds: [{
                    color: discord_js_1.Colors.Yellow,
                    description: (0, config_1.reply)('warn', (0, config_1.text)(locale, 'cmd.003.013.success', member.user.tag, warnings))
                }]
        });
    }
    catch (error) {
        console.error('[CommandWarn:ERR] No se pudo confirmar el aviso:', error);
    }
    // Va después de guardar el aviso: el escalado lo cuenta y, si alcanza un
    // umbral, sanciona y avisa en este mismo canal.
    await (0, automod_escalation_1.applyManualEscalation)(member.guild, member.id, target.channelId).catch(error => {
        console.error('[CommandWarn:ERR] No se pudo evaluar el escalado:', error);
    });
}
/** Retira el aviso más reciente de un miembro, pensado para corregir un error. */
async function removeLastWarning(target, args = []) {
    const locale = await (0, moderation_1.moderationLocale)(target);
    if (!await (0, moderation_1.ensureModerationPermissions)(target, locale, ['ModerateMembers'], []))
        return;
    const resolved = await (0, moderation_1.resolveGuildMember)(target, args);
    if (!resolved) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.member.required'), true);
        return;
    }
    const { member } = resolved;
    // La misma validación que al avisar: nadie puede retirarse sus propios avisos
    // ni los de alguien por encima.
    if (!await (0, moderation_1.validateTargetMember)(target, member, locale, 'warn'))
        return;
    try {
        const removed = await Infraction_1.default.removeLatestWarning(member.guild.id, member.id);
        if (!removed) {
            await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.013.none', member.user.tag), true);
            return;
        }
        await target.reply({
            embeds: [{
                    color: discord_js_1.Colors.Green,
                    description: (0, config_1.reply)('ok', (0, config_1.text)(locale, 'cmd.003.013.removed', member.user.tag))
                }]
        });
    }
    catch (error) {
        console.error('[CommandWarn:ERR] No se pudo retirar el aviso:', error);
        await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
