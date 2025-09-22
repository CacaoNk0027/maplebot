"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const Guild_1 = __importDefault(require("../../../shared/bot/models/Guild"));
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const discord_js_1 = require("discord.js");
const config_1 = require("../../../bot/config/config");
const command = {
    data: new command_data_1.default()
        .setName('prefix')
        .setDescription('Establece un prefix personalizado para la bot')
        .setDescriptionLocalization('en-US', 'Set a custom prefix for the bot')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageChannels)
        .setAliases('px', 'prefijo')
        .setUserPermissions('ManageChannels')
        .setId('001', '004')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('new-prefix')
        .setDescription('Escribe un nuevo prefijo para establecer')
        .setDescriptionLocalization('en-US', 'Write a new prefix to set')
        .setMaxLength(4)),
    async exec(interaction) {
        let option = interaction.options.getString('new-prefix');
        if (!option) {
            prefix(interaction);
        }
        else {
            setPrefix(interaction, [option]);
        }
    },
    async message(message, args) {
        let option = args[0] || null;
        if (!option) {
            prefix(message);
            return;
        }
        if (option.length > 4) {
            await (0, config_1.send)(message, 'warn', 'El nuevo prefix no puede tener más de 4 caracteres', true);
            return;
        }
        setPrefix(message, args);
    }
};
exports.command = command;
async function prefix(target) {
    let prefix = await Guild_1.default.getPrefix(target.guildId);
    if (!prefix) {
        await (0, config_1.send)(target, 'warn', 'No hay un prefix establecido para este servidor, el prefix actual es **m!**', true);
        return;
    }
    await target.reply({
        embeds: [{
                author: {
                    name: target.guild?.name || 'Servidor',
                    icon_url: target.guild?.iconURL({ forceStatic: false }) || ''
                },
                title: 'Prefix | ' + prefix,
                description: `El prefijo actual es **${prefix}**`,
                fields: [{
                        name: 'ℹ️ | Establece un nuevo prefix',
                        value: (0, config_1.code_text)(`${prefix}prefix <prefix>`)
                    }],
                color: config_1.theme_color
            }]
    });
}
async function setPrefix(target, args) {
    let guild = await Guild_1.default.findServer(target.guildId);
    let new_prefix = args[0].toLowerCase() || '';
    if (!guild) {
        if (new_prefix == 'm!') {
            await (0, config_1.send)(target, 'warn', 'El prefix no puede ser igual al preterminado a menos que se reestablezca de uno preterminado', true);
            return;
        }
        let new_model = new Guild_1.default({
            guildId: target.guildId,
            prefix: new_prefix
        });
        await new_model.save();
    }
    else {
        if (new_prefix == guild.prefix) {
            await (0, config_1.send)(target, 'warn', 'El prefix actual es identico al actual', true);
            return;
        }
        if (new_prefix == 'm!' && guild.prefix.length > 0) {
            guild.prefix = '';
            await guild.save();
            await (0, config_1.send)(target, 'ok', 'El prefix se reestablecio, ahora se usara el preterminado.', true);
            return;
        }
        if (new_prefix == 'm!' && guild.prefix.length < 1) {
            await (0, config_1.send)(target, 'warn', 'El prefix no puede ser igual al preterminado a menos que se reestablezca de uno preterminado', true);
            return;
        }
        guild.prefix = new_prefix;
        await guild.save();
    }
    await (0, config_1.send)(target, 'ok', `Se estableció **${new_prefix}** como prefijo personalizado`, true);
}
