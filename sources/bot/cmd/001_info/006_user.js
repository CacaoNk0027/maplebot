"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const user_1 = __importDefault(require("../../../bot/structs/user"));
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const discord = __importStar(require("discord.js"));
const config_1 = require("../../../bot/config/config");
const hex_color_regex_1 = __importDefault(require("hex-color-regex"));
const _001_avatar_1 = require("../002_util/001_avatar");
const _002_banner_1 = require("../002_util/002_banner");
const _003_member_1 = require("../002_util/003_member");
const command = {
    data: new command_data_1.default()
        .setName('user')
        .setId('006', '001')
        .setDescription('Muestra tu información o la de un usuario')
        .setDescriptionLocalization('en-US', 'Shows your information or that of a user')
        .addSubcommand(new discord.SlashCommandSubcommandBuilder()
        .setName('info')
        .setDescription('la información general')
        .setDescriptionLocalization('en-US', 'the general information')
        .addUserOption(new discord.SlashCommandUserOption()
        .setName('user')
        .setDescription('El usuario a mostrar')
        .setDescriptionLocalization('en-US', 'The user to show'))).addSubcommand(new discord.SlashCommandSubcommandBuilder()
        .setName('avatar')
        .setDescription('Muestra el avatar del usuario')
        .setDescriptionLocalization('en-US', 'Shows the user\'s avatar')
        .addUserOption(new discord.SlashCommandUserOption()
        .setName('user')
        .setDescription('El usuario a mostrar')
        .setDescriptionLocalization('en-US', 'The user to show'))).addSubcommand(new discord.SlashCommandSubcommandBuilder()
        .setName('banner')
        .setDescription('Muestra tu banner o el de un usuario')
        .setDescriptionLocalization('en-US', 'Shows your banner or that of a user')
        .addUserOption(new discord.SlashCommandUserOption()
        .setName('user')
        .setDescription('El usuario a mostrar')
        .setDescriptionLocalization('en-US', 'The user to show'))).addSubcommand(new discord.SlashCommandSubcommandBuilder()
        .setName('member')
        .setDescription('Muestra tu perfil como miembro o el de un usuario')
        .setDescriptionLocalization('en-US', 'Shows your profile as a member or that of a user')
        .addUserOption(new discord.SlashCommandUserOption()
        .setName('user')
        .setDescription('El usuario a mostrar')
        .setDescriptionLocalization('en-US', 'The user to show'))),
    async exec(interaction) {
        await response(interaction);
    },
    async message(message, args) {
        await response(message, args);
    }
};
exports.command = command;
async function response(caller, args) {
    const locale = await (0, config_1._locale)(caller.guild);
    try {
        const user = await (await new user_1.default().getInfo(caller, args))?.fetch() ?? (caller instanceof discord.Message ? caller.author : caller.user);
        let target;
        caller instanceof discord.ChatInputCommandInteraction ?
            target = caller.options.getSubcommand() : target = args ? args[0] : 'info';
        switch (target) {
            case 'avatar':
                if (caller instanceof discord.ChatInputCommandInteraction) {
                    await _001_avatar_1.command.exec(caller);
                }
                else if (_001_avatar_1.command.message) {
                    await _001_avatar_1.command.message(caller, ['global', user.id]);
                }
                break;
            case 'banner':
                if (caller instanceof discord.ChatInputCommandInteraction) {
                    await _002_banner_1.command.exec(caller);
                }
                else if (_002_banner_1.command.message) {
                    await _002_banner_1.command.message(caller, ['global', user.id]);
                }
                break;
            case 'member':
                if (caller instanceof discord.ChatInputCommandInteraction) {
                    await _003_member_1.command.exec(caller);
                }
                else if (_003_member_1.command.message) {
                    await _003_member_1.command.message(caller, [user.id]);
                }
                break;
            default: await info(locale, caller, user);
        }
    }
    catch (error) {
        console.error(error);
        await (0, config_1.send)(caller, 'error', (0, config_1.text)(locale, 'reply.error'), true);
        return;
    }
}
async function info(locale, caller, user) {
    const badges = user.flags?.toArray().length
        ? (0, config_1.user_flags)(user)
        : (0, config_1.text)(locale, 'cmd.001.006.badges.none');
    let embed = new discord.EmbedBuilder()
        .setColor((0, hex_color_regex_1.default)({ strict: true }).test(user.hexAccentColor ?? '0') ? user.hexAccentColor : (0, config_1.random_color)())
        .setThumbnail(user.avatarURL({ forceStatic: false }))
        .setDescription((0, config_1.text)(locale, 'cmd.001.006.description', user.id, user.globalName ?? user.displayName ?? user.username, user.avatarDecorationData ? `[URL](${user.avatarDecorationURL()})` : `N/a`, user.banner ? `[URL](${user.bannerURL({ forceStatic: false, size: 1024 })})` : user.hexAccentColor ?? 'N/a')).setTitle((0, config_1.text)(locale, 'cmd.001.006.title', user.username))
        .addFields([{
            name: (0, config_1.text)(locale, 'cmd.001.006.field1.name'),
            value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`
        }, {
            name: (0, config_1.text)(locale, 'cmd.001.006.field2.name'),
            value: badges,
            inline: true,
        }]);
    if (user.primaryGuild?.identityEnabled)
        embed.setAuthor({
            name: user.primaryGuild.tag ?? 'N/a',
            iconURL: user.primaryGuild.badge ? `https://cdn.discordapp.com/clan-badges/${user.primaryGuild.identityGuildId}/${user.primaryGuild.badge}.png` : undefined
        });
    if (user.bot)
        embed.addFields([{
                name: (0, config_1.text)(locale, 'cmd.001.006.field3.name'),
                value: user.bot ? '✅' : '❌',
                inline: true
            }]);
    await caller.reply({
        embeds: [embed]
    });
}
