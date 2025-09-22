"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const user_1 = __importDefault(require("../../structs/user"));
const config_1 = require("../../config/config");
const member_1 = __importDefault(require("../../structs/member"));
const command = {
    data: new command_data_1.default()
        .setName('banner')
        .setAliases('fondo')
        .setId('002', '002')
        .setDescription('Muestra tu banner o el de un usuario')
        .setDescriptionLocalization('en-US', 'Shows your banner or that of a user')
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('global')
        .setDescription('Muestra el banner global')
        .setDescriptionLocalization('en-US', 'Shows the global banner')
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('El usuario a mostrar')
        .setDescriptionLocalization('en-US', 'The user to show'))).addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('server')
        .setDescription('Muestra el banner de usuario en el servidor')
        .setDescriptionLocalization('en-US', 'Shows the user\'s banner in the server')
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
        globalBanner(target, user);
    }
    else if (identifier == 'member') {
        let member = await new member_1.default().getInfo(target, [user.id]);
        if (!member) {
            await (0, config_1.send)(target, 'error', 'No se pudo obtener algún usuario, por favor intenta de nuevo', true);
            return;
        }
        memberBanner(target, member);
    }
    else {
        globalBanner(target, user);
    }
}
async function globalBanner(target, user) {
    if (!user.banner) {
        await (0, config_1.send)(target, 'warn', 'El usuario no cuenta con un banner global', true);
        return;
    }
    await target.reply({
        embeds: [{
                color: user.accentColor || (0, config_1.random_color)(),
                description: `[Url del banner](${user.bannerURL({ forceStatic: false, size: 1024 })})`,
                image: {
                    url: user.bannerURL({ forceStatic: false, size: 1024 }) || ''
                },
                title: `👤 | Banner de ${user.globalName || user.username}`
            }]
    });
}
async function memberBanner(target, member) {
    if (!member.banner) {
        await (0, config_1.send)(target, 'warn', 'El usuario no cuenta con un banner en este servidor', true);
        return;
    }
    await target.reply({
        embeds: [{
                color: member.user.accentColor || (0, config_1.random_color)(),
                description: `[Url del banner](${member.bannerURL({ forceStatic: false, size: 1024 })})`,
                image: {
                    url: member.bannerURL({ forceStatic: false, size: 1024 }) || ''
                },
                title: `👤 | Banner de ${member.nickname || member.user.globalName || member.user.username}`
            }]
    });
}
