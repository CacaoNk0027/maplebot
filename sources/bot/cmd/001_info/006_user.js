"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const user_1 = __importDefault(require("../../../bot/structs/user"));
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const discord_js_1 = require("discord.js");
const config_1 = require("../../../bot/config/config");
const _001_avatar_1 = require("../002_util/001_avatar");
const _002_banner_1 = require("../002_util/002_banner");
const _003_member_1 = require("../002_util/003_member");
const command = {
    data: new command_data_1.default()
        .setName('user')
        .setId('006', '001')
        .setDescription('Muestra tu información o la de un usuario')
        .setDescriptionLocalization('en-US', 'Shows your information or that of a user')
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('info')
        .setDescription('la información general')
        .setDescriptionLocalization('en-US', 'the general information')
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('El usuario a mostrar')
        .setDescriptionLocalization('en-US', 'The user to show'))).addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('avatar')
        .setDescription('Muestra el avatar del usuario')
        .setDescriptionLocalization('en-US', 'Shows the user\'s avatar')
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('El usuario a mostrar')
        .setDescriptionLocalization('en-US', 'The user to show'))).addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('banner')
        .setDescription('Muestra tu banner o el de un usuario')
        .setDescriptionLocalization('en-US', 'Shows your banner or that of a user')
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('El usuario a mostrar')
        .setDescriptionLocalization('en-US', 'The user to show'))).addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('member')
        .setDescription('Muestra tu perfil como miembro o el de un usuario')
        .setDescriptionLocalization('en-US', 'Shows your profile as a member or that of a user')
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('El usuario a mostrar')
        .setDescriptionLocalization('en-US', 'The user to show'))),
    async exec(interaction) {
        let identifier = interaction.options.getSubcommand();
        let user = (await (await new user_1.default().getInfo(interaction))?.fetch());
        if (!user) {
            await (0, config_1.send)(interaction, 'error', 'No se pudo obtener algún usuario, por favor intenta de nuevo', true);
            return;
        }
        conditions(interaction, user, identifier);
    },
    async message(message, args) {
        let identifier = args[0];
        let user = (await (await new user_1.default().getInfo(message, args))?.fetch());
        if (!user) {
            await (0, config_1.send)(message, 'error', 'No se pudo obtener algún usuario, por favor intenta de nuevo', true);
            return;
        }
        conditions(message, user, identifier);
    }
};
exports.command = command;
async function conditions(target, user, identifier) {
    if (identifier == 'info') {
        info(target, user);
    }
    else if (identifier == 'avatar') {
        if (target instanceof discord_js_1.ChatInputCommandInteraction) {
            await _001_avatar_1.command.exec(target);
        }
        else if (_001_avatar_1.command.message) {
            await _001_avatar_1.command.message(target, ['global', user.id]);
        }
    }
    else if (identifier == 'banner') {
        if (target instanceof discord_js_1.ChatInputCommandInteraction) {
            await _002_banner_1.command.exec(target);
        }
        else if (_002_banner_1.command.message) {
            await _002_banner_1.command.message(target, ['global', user.id]);
        }
    }
    else if (identifier == 'member') {
        if (target instanceof discord_js_1.ChatInputCommandInteraction) {
            await _003_member_1.command.exec(target);
        }
        else if (_003_member_1.command.message) {
            await _003_member_1.command.message(target, [user.id]);
        }
    }
    else {
        info(target, user);
    }
}
async function info(target, user) {
    await target.reply({
        embeds: [{
                author: {
                    name: user.username,
                    icon_url: user.avatarURL({ forceStatic: false }) || ''
                },
                description: description(user),
                color: user.accentColor || (0, config_1.random_color)(),
                fields: [{
                        name: `Fecha de ingreso a discord`,
                        value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`
                    }, {
                        name: `Insignias`,
                        value: (0, config_1.user_flags)(user)
                    }],
                thumbnail: {
                    url: user.avatarURL({ forceStatic: false }) || ''
                },
                title: `Información de usuario`
            }]
    });
}
function description(user) {
    return `**ID** | \`${user.id}\`${user.globalName ? `\n**Nombre** | ${user.globalName}` : ''}${user.avatarDecorationData ? `\n**Decoración de avatar** | [Link](${user.avatarDecorationURL()})` : ''}${user.banner ? `\n**Banner** | [Link](${user.bannerURL()})` : ''}${user.hexAccentColor ? `\n**Color establecido** | ${user.hexAccentColor}` : ''}${user.bot ? `\n**Bot Verificado** | ${user.flags?.has('VerifiedBot') ? 'Sí' : 'No'}` : ''}`;
}
