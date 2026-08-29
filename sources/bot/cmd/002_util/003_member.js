"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const member_1 = __importDefault(require("../../structs/member"));
const config_1 = require("../../config/config");
const command = {
    data: new command_data_1.default()
        .setName('member')
        .setId('003', '002')
        .setAliases('miembro')
        .setDescription('Muestra información sobre un miembro del servidor')
        .setDescriptionLocalization('en-US', 'Shows information about a server member')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('El usuario a mostrar')
        .setDescriptionLocalization('en-US', 'The user to show')),
    async exec(interaction) {
        await response(interaction);
    },
    async message(message, args) {
        await response(message, args);
    }
};
exports.command = command;
async function response(caller, args = []) {
    const locale = await (0, config_1._locale)(caller.guild);
    try {
        if (!caller.guild) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.guild_only'), true);
            return;
        }
        const selectedMember = await new member_1.default().getInfo(caller, args);
        if (!selectedMember) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.member.not_found'), true);
            return;
        }
        const member = await selectedMember.fetch();
        const user = await member.user.fetch();
        const roles = member.roles.cache
            .filter(role => role.id !== member.guild.id)
            .map(role => `<@&${role.id}>`);
        const visibleRoles = roles.slice(0, 30);
        const rolesText = roles.length === 0
            ? (0, config_1.text)(locale, 'cmd.002.003.roles.none')
            : `${visibleRoles.join(' ')}${roles.length > visibleRoles.length
                ? `\n${(0, config_1.text)(locale, 'cmd.002.003.roles.more', roles.length - visibleRoles.length)}`
                : ''}`;
        const joinedTimestamp = Math.floor((member.joinedTimestamp ?? 0) / 1000);
        await caller.reply({
            embeds: [{
                    author: {
                        name: user.username,
                        icon_url: user.displayAvatarURL({ forceStatic: false })
                    },
                    color: member.displayColor || user.accentColor || (0, config_1.random_color)(),
                    description: memberDescription(locale, member),
                    fields: [{
                            name: `<:Dis_pinnedMessages:888232861684084747> | ${(0, config_1.text)(locale, 'cmd.002.003.joined')}`,
                            value: joinedTimestamp > 0 ? `<t:${joinedTimestamp}:F>` : (0, config_1.text)(locale, 'cmd.002.unknown')
                        }, {
                            name: `<:Dis_rol:888234105332981781> | ${(0, config_1.text)(locale, 'cmd.002.003.roles')}`,
                            value: rolesText
                        }],
                    thumbnail: {
                        url: member.displayAvatarURL({ forceStatic: false })
                    },
                    title: (0, config_1.text)(locale, 'cmd.002.003.title')
                }]
        });
    }
    catch (error) {
        console.error('[CommandMember:ERR] No se pudo obtener la información del miembro:', error);
        await (0, config_1.send)(caller, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
function memberDescription(locale, member) {
    const decorationURL = member.avatarDecorationURL();
    const bannerURL = member.bannerURL({ forceStatic: false, size: 1024 });
    return (0, config_1.text)(locale, 'cmd.002.003.description', member.id, member.displayName, decorationURL ? `[URL](${decorationURL})` : (0, config_1.text)(locale, 'cmd.002.none'), bannerURL ? `[URL](${bannerURL})` : (0, config_1.text)(locale, 'cmd.002.none'), member.displayColor ? member.displayHexColor : (0, config_1.text)(locale, 'cmd.002.none'));
}
