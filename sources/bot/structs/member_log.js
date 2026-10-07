"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMemberJoin = logMemberJoin;
exports.logMemberLeave = logMemberLeave;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const log_dispatch_1 = require("./log_dispatch");
async function logMemberJoin(member) {
    if (member.user.bot)
        return;
    if (!await (0, log_dispatch_1.isLogEnabled)(member.guild.id, 'member.join'))
        return;
    const locale = await (0, config_1._locale)(member.guild);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Green)
        .setTitle((0, config_1.text)(locale, 'log.member.join.title'))
        .setThumbnail(member.user.displayAvatarURL())
        .addFields({
        name: (0, config_1.text)(locale, 'log.field.member'),
        value: `${member.user} (${(0, discord_js_1.escapeMarkdown)(member.user.tag)})`
    }, {
        name: (0, config_1.text)(locale, 'log.field.account_created'),
        value: (0, discord_js_1.time)(member.user.createdAt, 'R'),
        inline: true
    }, {
        name: (0, config_1.text)(locale, 'log.field.members'),
        value: String(member.guild.memberCount),
        inline: true
    })
        .setFooter({ text: `ID: ${member.id}` })
        .setTimestamp();
    await (0, log_dispatch_1.sendLog)(member.guild, 'member.join', embed);
}
async function logMemberLeave(member) {
    if (member.user.bot)
        return;
    if (!await (0, log_dispatch_1.isLogEnabled)(member.guild.id, 'member.leave'))
        return;
    const locale = await (0, config_1._locale)(member.guild);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Orange)
        .setTitle((0, config_1.text)(locale, 'log.member.leave.title'))
        .setThumbnail(member.user.displayAvatarURL())
        .addFields({
        name: (0, config_1.text)(locale, 'log.field.member'),
        value: `${member.user} (${(0, discord_js_1.escapeMarkdown)(member.user.tag)})`
    })
        .setFooter({ text: `ID: ${member.id}` })
        .setTimestamp();
    // Fecha de entrada y roles solo existen si el miembro estaba en caché.
    if (member.joinedAt) {
        embed.addFields({
            name: (0, config_1.text)(locale, 'log.field.joined'),
            value: (0, discord_js_1.time)(member.joinedAt, 'R'),
            inline: true
        });
    }
    const roles = member.roles?.cache
        ?.filter(role => role.id !== member.guild.id)
        .map(role => `<@&${role.id}>`) ?? [];
    if (roles.length) {
        const value = roles.join(' ');
        embed.addFields({
            name: (0, config_1.text)(locale, 'log.field.roles'),
            value: value.length > 1000 ? `${value.slice(0, 1000)}…` : value
        });
    }
    await (0, log_dispatch_1.sendLog)(member.guild, 'member.leave', embed);
}
