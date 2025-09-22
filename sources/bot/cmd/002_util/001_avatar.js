"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const user_1 = __importDefault(require("../../../bot/structs/user"));
const config_1 = require("../../../bot/config/config");
const member_1 = __importDefault(require("../../../bot/structs/member"));
const command = {
    data: new command_data_1.default()
        .setName('avatar')
        .setAliases('imagen', 'av')
        .setId('001', '002')
        .setDescription('Muestra tu avatar o el de un usuario')
        .setDescriptionLocalization('en-US', 'Shows your avatar or that of a user')
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('global')
        .setDescription('Muestra el avatar global')
        .setDescriptionLocalization('en-US', 'Shows the global avatar')
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('El usuario a mostrar')
        .setDescriptionLocalization('en-US', 'The user to show'))).addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('server')
        .setDescription('Muestra el avatar de usuario en el servidor')
        .setDescriptionLocalization('en-US', 'Shows the user\'s avatar in the server')
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
    if (identifier == 'global') {
        globalAvatar(target, user);
    }
    else if (identifier == 'member') {
        let member = await new member_1.default().getInfo(target, [user.id]);
        if (!member) {
            await (0, config_1.send)(target, 'error', 'No se pudo obtener algún usuario, por favor intenta de nuevo', true);
            return;
        }
        memberAvatar(target, member);
    }
    else {
        globalAvatar(target, user);
    }
}
async function globalAvatar(target, user) {
    if (!user.avatar) {
        await (0, config_1.send)(target, 'warn', 'El usuario no cuenta con un avatar global', true);
        return;
    }
    await target.reply({
        embeds: [{
                color: user.accentColor || (0, config_1.random_color)(),
                description: `[Url del avatar](${user.avatarURL({ forceStatic: false, size: 1024 })})`,
                image: {
                    url: user.avatarURL({ forceStatic: false, size: 1024 }) || ''
                },
                title: `👤 | Avatar de ${user.globalName || user.username}`
            }]
    });
}
async function memberAvatar(target, member) {
    if (!member.avatar) {
        await (0, config_1.send)(target, 'warn', 'El usuario no cuenta con un avatar en este servidor', true);
        return;
    }
    await target.reply({
        embeds: [{
                color: member.user.accentColor || (0, config_1.random_color)(),
                description: `[Url del avatar](${member.avatarURL({ forceStatic: false, size: 1024 })})`,
                image: {
                    url: member.avatarURL({ forceStatic: false, size: 1024 }) || ''
                },
                title: `👤 | Avatar de ${member.nickname || member.user.globalName || member.user.username}`
            }]
    });
}
