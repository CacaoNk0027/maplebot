"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setChannelLock = setChannelLock;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const moderation_1 = require("./moderation");
async function setChannelLock(target, args = [], locked) {
    const locale = await (0, moderation_1.moderationLocale)(target);
    if (!await (0, moderation_1.ensureModerationPermissions)(target, locale, ['ManageChannels'], ['ManageChannels']))
        return;
    const channel = await (0, moderation_1.resolveGuildChannel)(target, args);
    if (!channel) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.channel.required'), true);
        return;
    }
    if (channel.type !== discord_js_1.ChannelType.GuildText) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.channel.text_only'), true);
        return;
    }
    const guild = target.guild;
    const actor = await guild.members.fetch(target instanceof discord_js_1.Message ? target.author.id : target.user.id);
    const bot = await guild.members.fetchMe();
    if (!channel.permissionsFor(actor).has(discord_js_1.PermissionFlagsBits.ManageChannels)) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.channel.permissions.user'), true);
        return;
    }
    if (!channel.permissionsFor(bot).has(discord_js_1.PermissionFlagsBits.ManageChannels)) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.channel.permissions.bot'), true);
        return;
    }
    const everyone = guild.roles.everyone;
    const overwrite = channel.permissionOverwrites.cache.get(everyone.id);
    const directlyDenied = overwrite?.deny.has(discord_js_1.PermissionFlagsBits.SendMessages) ?? false;
    const directlyAllowed = overwrite?.allow.has(discord_js_1.PermissionFlagsBits.SendMessages) ?? false;
    const alreadyInRequestedState = locked
        ? directlyDenied
        : !directlyDenied && !directlyAllowed;
    if (alreadyInRequestedState) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, locked ? 'system.003.channel.already_locked' : 'system.003.channel.already_unlocked'), true);
        return;
    }
    try {
        await channel.permissionOverwrites.edit(everyone, { SendMessages: locked ? false : null }, { reason: auditReason(target, locked) });
        await target.reply({
            embeds: [{
                    color: discord_js_1.Colors.Green,
                    description: (0, config_1.reply)('ok', (0, config_1.text)(locale, locked ? 'cmd.003.003.success' : 'cmd.003.006.success', channel.toString()))
                }]
        });
    }
    catch (error) {
        console.error(`[CommandChannelLock:ERR] No se pudo ${locked ? 'bloquear' : 'desbloquear'} el canal:`, error);
        await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
function auditReason(target, locked) {
    const actor = target instanceof discord_js_1.Message ? target.author : target.user;
    return `${locked ? 'Channel locked' : 'Channel unlocked'} by ${actor.tag} (${actor.id})`;
}
