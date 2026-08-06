"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const config_1 = require("../../../bot/config/config");
let verificacion = [
    '- sin restricciones',
    'baja',
    'media',
    'alta',
    '+ muy alta'
];
const command = {
    data: new command_data_1.default()
        .setName('server')
        .setId('005', '001')
        .setAliases('servidor', 'sv', 'serverinfo', 'svinfo')
        .setDescription('Muestra información del servidor actual')
        .setDescriptionLocalization('en-US', 'Shows information about the current server')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('info')
        .setDescription('la información general')
        .setDescriptionLocalization('en-US', 'the general information')).addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('icon')
        .setDescription('Muestra el ícono del servidor')
        .setDescriptionLocalization('en-US', 'Shows the server icon')).addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('banner')
        .setDescription('Muestra el banner del servidor')
        .setDescriptionLocalization('en-US', 'Shows the server banner')),
    async exec(interaction) {
        try {
            let identifier = interaction.options.getSubcommand();
            switch (identifier) {
                case 'info':
                    await info(interaction);
                    break;
                case 'banner':
                    await banner(interaction);
                    break;
                default:
                    await info(interaction);
            }
        }
        catch (error) {
            console.error(error);
            await (0, config_1.send)(interaction, 'error', 'Ha sucedido un error al ejecutar este comando.', true);
        }
    },
    async message(message, args) {
        try {
            let identifier = args[0];
            switch (identifier) {
                case 'info':
                    await info(message);
                    break;
                case 'banner':
                    await banner(message);
                    break;
                default:
                    await info(message);
            }
        }
        catch (error) {
            console.error(error);
            await (0, config_1.send)(message, 'error', 'Ha sucedido un error al ejecutar este comando.', true);
        }
    }
};
exports.command = command;
async function info(message) {
    let guild = await message.guild?.fetch();
    let owner = await guild?.fetchOwner();
    let members = guild?.members.cache.filter(member => !member.user.bot).size ?? 0;
    let bots = guild?.members.cache.filter(member => member.user.bot).size ?? 0;
    await message.reply({
        embeds: [{
                author: {
                    name: `Owner 👑 | ${owner?.user.username}`,
                    icon_url: owner?.user.avatarURL({ forceStatic: false }) || ''
                },
                color: (0, config_1.random_color)(),
                thumbnail: {
                    url: guild?.iconURL({ forceStatic: false }) || ''
                },
                description: guild?.description || 'Sin descripción de servidor',
                title: guild?.name,
                fields: [{
                        name: '🆔 | ID',
                        value: `\`${guild?.id}\``
                    }, {
                        name: '<:Dis_pinnedMessages:888232861684084747> | Fecha de creación',
                        value: `<t:${Math.floor((guild?.createdTimestamp ?? 0) / 1000)}:F>`
                    }, {
                        name: '<:Dis_memberList:888232778418749491> | Usuarios',
                        value: (0, config_1.code_text)(`Miembros [${members}]\nBots [${bots}]\nTotales [${members + bots}]`, 'js'),
                        inline: true
                    }, {
                        name: '<:Dis_channelThread:888230841942151171> | Canales',
                        value: (0, config_1.code_text)(`Categorias [${guild?.channels.cache.filter(channel => channel.type == discord_js_1.ChannelType.GuildCategory).size}]\nTexto [${guild?.channels.cache.filter(channel => channel.type == discord_js_1.ChannelType.GuildText).size}]\nVoz [${guild?.channels.cache.filter(channel => channel.type == discord_js_1.ChannelType.GuildVoice).size}]`, 'js'),
                        inline: true
                    }, {
                        name: '<:Dis_sticker:888234162903994378> | Roles y emojis',
                        value: (0, config_1.code_text)(`Roles [${guild?.roles.cache.size}] | Emojis [${guild?.emojis.cache.size}]`, 'js')
                    }, {
                        name: '<:Dis_boostLv1:888234250757890099> | Nivel de mejoras',
                        value: (0, config_1.code_text)((guild?.premiumTier !== undefined && guild?.premiumTier !== null ? String(guild.premiumTier) : "- sin nivel"), 'diff'),
                        inline: true
                    }, {
                        name: '<:Dis_boostLv2:888234340121727006> | Mejoras totales',
                        value: (0, config_1.code_text)(guild?.premiumSubscriptionCount != null ? guild.premiumSubscriptionCount.toString() : '0'),
                        inline: true
                    }, {
                        name: '<:Dis_channelRules:888231318876487731> | Nivel de verificacion',
                        value: (0, config_1.code_text)(`${guild?.verificationLevel !== undefined ? verificacion[guild.verificationLevel] : '- desconocido'}`, 'diff')
                    }],
                footer: {
                    text: 'información del servidor'
                }
            }]
    });
}
async function banner(target) {
    let bannerUrl = target.guild?.bannerURL({ forceStatic: false, size: 1024 });
    let embed = new discord_js_1.EmbedBuilder();
    if (!bannerUrl) {
        await (0, config_1.send)(target, 'warn', 'Este servidor no tiene un banner establecido', true);
        return;
    }
    embed.setAuthor({ name: target.guild?.name || '', iconURL: target.guild?.iconURL({ forceStatic: false }) || '' })
        .setTitle('Banner del servidor')
        .setColor((0, config_1.random_color)())
        .setImage(bannerUrl);
    await target.reply({
        embeds: [embed]
    });
}
