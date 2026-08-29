"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const config_1 = require("../../../bot/config/config");
const _004_icon_1 = require("../002_util/004_icon");
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
        await response(interaction, interaction.options.getSubcommand());
    },
    async message(message, args) {
        await response(message, args[0]);
    }
};
exports.command = command;
async function response(caller, identifier) {
    let locale = await (0, config_1._locale)(caller.guild);
    try {
        if (!caller.guild) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.001.005.guild_only'), true);
            return;
        }
        switch (identifier) {
            case 'info':
                await info(caller);
                break;
            case 'banner':
                await banner(caller);
                break;
            case 'icon':
                if (caller instanceof discord_js_1.ChatInputCommandInteraction) {
                    await _004_icon_1.command.exec(caller);
                }
                else if (_004_icon_1.command.message) {
                    await _004_icon_1.command.message(caller, []);
                }
                break;
            default:
                await info(caller);
        }
    }
    catch (error) {
        console.error(error);
        await (0, config_1.send)(caller, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
async function info(message) {
    let locale = await (0, config_1._locale)(message.guild);
    let guild = await message.guild.fetch();
    let owner = await guild.fetchOwner();
    let bots = guild.members.cache.filter(member => member.user.bot).size;
    let members = guild.members.cache.filter(member => !member.user.bot).size;
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
                description: guild?.description || (0, config_1.text)(locale, 'cmd.001.005.description'),
                title: guild?.name,
                fields: [{
                        name: '🆔 | ID',
                        value: `\`${guild?.id}\``
                    }, {
                        name: `<:Dis_pinnedMessages:888232861684084747> | ${(0, config_1.text)(locale, 'cmd.001.005.field2.name')}`,
                        value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`
                    }, {
                        name: `<:Dis_memberList:888232778418749491> | ${(0, config_1.text)(locale, 'cmd.001.004.field1.name')}`,
                        value: (0, config_1.code_text)((0, config_1.text)(locale, 'cmd.001.005.field3.value', members, bots, members + bots), 'js'),
                        inline: true
                    }, {
                        name: `<:Dis_channelThread:888230841942151171> | ${(0, config_1.text)(locale, "cmd.001.004.field3.name")}`,
                        value: (0, config_1.code_text)((0, config_1.text)(locale, 'cmd.001.005.field4.value', guild?.channels.cache.filter(c => c.type == discord_js_1.ChannelType.GuildCategory).size, guild?.channels.cache.filter(c => c.type == discord_js_1.ChannelType.GuildText).size, guild?.channels.cache.filter(c => c.type == discord_js_1.ChannelType.GuildVoice).size), 'js'),
                        inline: true
                    }, {
                        name: `<:Dis_sticker:888234162903994378> | ${(0, config_1.text)(locale, 'cmd.001.005.field5.name')}`,
                        value: (0, config_1.code_text)((0, config_1.text)(locale, 'cmd.001.005.field5.value', guild?.roles.cache.size, guild?.emojis.cache.size), 'js')
                    }, {
                        name: `<:Dis_boostLv1:888234250757890099> | ${(0, config_1.text)(locale, 'cmd.001.005.field6.name')}`,
                        value: (0, config_1.code_text)((guild?.premiumTier !== undefined && guild?.premiumTier !== null ? String(guild.premiumTier) : "- N/a"), 'diff'),
                        inline: true
                    }, {
                        name: `<:Dis_boostLv2:888234340121727006> | ${(0, config_1.text)(locale, 'cmd.001.005.field7.name')}`,
                        value: (0, config_1.code_text)(guild?.premiumSubscriptionCount != null ? guild.premiumSubscriptionCount.toString() : '0'),
                        inline: true
                    }, {
                        name: `<:Dis_channelRules:888231318876487731> | ${(0, config_1.text)(locale, 'cmd.001.005.field8.name')}`,
                        value: (0, config_1.code_text)(`${guild?.verificationLevel !== undefined ? (0, config_1.verificacion)(guild.verificationLevel, locale) : '- N/a'}`, 'diff')
                    }]
            }]
    });
}
async function banner(target) {
    let locale = await (0, config_1._locale)(target.guild);
    let bannerUrl = target.guild?.bannerURL({ forceStatic: false, size: 1024 });
    let embed = new discord_js_1.EmbedBuilder();
    if (!bannerUrl) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.001.005.banner.warn'), true);
        return;
    }
    embed.setAuthor({ name: target.guild?.name || 'n/a', iconURL: target.guild?.iconURL({ forceStatic: false }) || undefined })
        .setTitle('Banner')
        .setDescription(`[URL](${bannerUrl})`)
        .setColor((0, config_1.random_color)())
        .setImage(bannerUrl);
    await target.reply({
        embeds: [embed]
    });
}
