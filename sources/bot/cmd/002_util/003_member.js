"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const member_1 = __importDefault(require("../../../bot/structs/member"));
const config_1 = require("../../../bot/config/config");
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
        let member = (await (await new member_1.default().getInfo(interaction)).fetch());
        let user = await member.user.fetch();
        let roles = member.roles.cache.filter(rol => rol != member.guild.roles.everyone).map(rol => `<@&${rol.id}>`);
        await interaction.reply({
            embeds: [{
                    author: {
                        name: user.username,
                        icon_url: user.avatarURL({ forceStatic: false }) ?? undefined
                    },
                    description: description(member),
                    color: member.displayColor || user.accentColor || (0, config_1.random_color)(),
                    fields: [{
                            name: '<:newmember:1262144151844028537> | Fecha de ingreso',
                            value: `<t:${Math.floor(member.joinedTimestamp || 0 / 1000)}:F>`,
                        }, {
                            name: '<:quest:1262143716643311678> | Roles',
                            value: roles.length > 1 ? roles.join(' ') : 'Sin roles'
                        }],
                    thumbnail: {
                        url: member.avatarURL({ forceStatic: false }) ?? user.avatarURL({ forceStatic: false }) ?? ''
                    },
                    title: 'Miembro del servidor'
                }]
        });
    },
    async message(message, args) {
        let member = (await (await new member_1.default().getInfo(message, args)).fetch());
        let user = member.user;
        let roles = member.roles.cache.filter(rol => rol != member.guild.roles.everyone).map(rol => `<@&${rol.id}>`);
        await message.reply({
            embeds: [{
                    author: {
                        name: user.username,
                        icon_url: user.avatarURL({ forceStatic: false }) ?? undefined
                    },
                    description: description(member),
                    color: member.displayColor || user.accentColor || (0, config_1.random_color)(),
                    fields: [{
                            name: '<:newmember:1262144151844028537> | Fecha de ingreso',
                            value: `<t:${Math.floor(member.joinedTimestamp || 0 / 1000)}:F>`,
                        }, {
                            name: '<:quest:1262143716643311678> | Roles',
                            value: roles.length > 1 ? roles.join(' ') : 'Sin roles'
                        }],
                    thumbnail: {
                        url: member.avatarURL({ forceStatic: false }) ?? user.avatarURL({ forceStatic: false }) ?? ''
                    },
                    title: 'Miembro del servidor'
                }]
        });
    }
};
exports.command = command;
function description(member) {
    return `**ID** | \`${member.id}\`${member.displayName ? `\n**Nombre de servidor** | ${member.displayName}` : ''}${member.avatarDecorationData ? `\n**Decoración de avatar** | [Link](${member.avatarDecorationURL()})` : ''}${member.banner ? `\n**Banner** | [Link](${member.bannerURL()})` : ''}${member.displayColor ? `\n**Color establecido** | ${member.displayColor}` : ''}`;
}
