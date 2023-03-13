const discord = require('discord.js')
const configs = require('../../sources/utils/exports')
const models = require('maplebot_models')
const nekoapi = require('nekoapi.beta')

exports.event = {
    name: 'guildMemberAdd',
    /**
     * @param {discord.Client} client
     * @param {discord.GuildMember} member
     */
    exec: async (client, member) => {
        if (configs.blacklist.servers.find(c => c.includes(member.guild.id))) return;
        let testWelcome = configs.parseJson(await models.schemas.Welcome.findOne({ guildID: member.guild.id }))
        let channels = await models.schemas.SetChannels.findOne({ guildID: member.guild.id })
        if(!channels || channels.welcome == null || !testWelcome) return;
        let channel; try {
            channel = await client.channels.fetch(channels.welcome);
        } catch (err) { return; };
        if (testWelcome.type == null || testWelcome.type == "image") {
            let welcome = new nekoapi.Welcome()
                .setTitle(configs.replaces_msg_g(member, testWelcome.title), testWelcome.colors.title, 45)
                .setAvatar(member.user.avatar ? member.user.avatarURL({ forceStatic: true, extension: "png" }) : defaultAvatar, testWelcome.colors.avatar)
                .setDescription(configs.replaces_msg_g(member, testWelcome.description), testWelcome.colors.description, 35)
                .setBackground(testWelcome.background.type, testWelcome.background.data)
            let attach = new discord.AttachmentBuilder()
                .setFile(await welcome.get()).setName(`bienvenido_${member.user.id}.png`)
            if (!testWelcome.message) return await channel.send({
                files: [attach]
            }); else await channel.send({
                content: configs.replaces_msg_g(member, testWelcome.message),
                files: [attach],
                allowedMentions: {
                    parse: ['users']
                }
            });
        } else {
            let embed = new discord.EmbedBuilder()
            if (testWelcome.background.type == "color") {
                embed.setColor(testWelcome.background.data)
                    .setImage(member.guild.banner ? member.guild.bannerURL({ forceStatic: false }) : null)
            } else {
                embed.setColor(randomColor())
                    .setImage(testWelcome.background.data)
            }
            embed.setAuthor({
                name: member.guild.name,
                iconURL: member.guild.iconURL({
                    forceStatic: false
                })
            })
                .setTitle(configs.replaces_msg_g(member, testWelcome.title))
                .setThumbnail(member.user.avatar ? member.user.avatarURL({
                    forceStatic: false
                }) : defaultAvatar)
                .setDescription(configs.replaces_msg_g(member, testWelcome.description))
                .setTimestamp()
            if (!testWelcome.message) return await channel.send({
                embeds: [embed]
            }); else await channel.send({
                content: configs.replaces_msg_g(member, testWelcome.message),
                embeds: [embed],
                allowedMentions: {
                    parse: ['users']
                }
            });
        }
    }
}