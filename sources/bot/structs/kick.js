"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kickMember = kickMember;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const moderation_1 = require("./moderation");
/**
 * Expulsa a un miembro y lo deja en el historial de infracciones.
 *
 * A diferencia del baneo, el objetivo tiene que seguir en el servidor, así que
 * se resuelve como miembro y la jerarquía se comprueba siempre.
 */
async function kickMember(target, args = []) {
    const locale = await (0, moderation_1.moderationLocale)(target);
    if (!await (0, moderation_1.ensureModerationPermissions)(target, locale, ['KickMembers'], ['KickMembers']))
        return;
    const resolved = await (0, moderation_1.resolveGuildMember)(target, args);
    if (!resolved) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.member.required'), true);
        return;
    }
    const { member, consumedArgument } = resolved;
    if (!await (0, moderation_1.validateTargetMember)(target, member, locale, 'kick'))
        return;
    const reason = await (0, moderation_1.readModerationReason)(target, args, consumedArgument, locale);
    if (reason === null)
        return;
    const actor = target instanceof discord_js_1.Message ? target.author : target.user;
    try {
        await member.kick(`Kick by ${actor.tag} (${actor.id}) | ${reason}`.slice(0, 512));
        await (0, moderation_1.recordManualInfraction)(member.guild.id, member.id, actor.id, 'kick', reason);
        await target.reply({
            embeds: [{
                    color: discord_js_1.Colors.Green,
                    description: (0, config_1.reply)('ok', (0, config_1.text)(locale, 'cmd.003.012.success', member.user.tag))
                }]
        });
    }
    catch (error) {
        console.error('[CommandKick:ERR] No se pudo expulsar al miembro:', error);
        await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
