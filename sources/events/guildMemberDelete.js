const discord = require('discord.js')
const config = require('../../sources/utils/exports')

const nekoapi = require('nekoapi.beta')
const { CBS } = require('../utils/models/_cbs')

exports.event = {
    name: 'guildMemberRemove',
    /**
     * @param {discord.Client} client
     * @param {discord.GuildMember} member
     */
    exec: async (client, member) => {
        if(await CBS.findOne({ creator: "801603753631285308" }) != null) {
            let blacklist = await CBS.findOne({ creator: "801603753631285308" }).exec().then((c) => c.ids);
            if (blacklist.find(c => c.includes(member.guild.id)) && member.user.id !== "801603753631285308") return;
        };
        let testWelcome = config.farewellJson(await config.schemas.Welcome.findOne({ guildID: member.guild.id }))
        let channels = await config.schemas.SetChannels.findOne({ guildID: member.guild.id })
        if(!channels || channels.welcome == null || !testWelcome) return;
        let channel; try {
            channel = await client.channels.fetch(channels.welcome);
        } catch (err) { return; };
        if (testWelcome.type == null || testWelcome.type == "image") {
            let welcome = new nekoapi.Welcome()
                .setTitle(config.replaces_msg_g(member, testWelcome.title), testWelcome.colors.title, 45)
                .setAvatar(member.user.avatar ? member.user.avatarURL({ forceStatic: true, extension: "png" }) : defaultAvatar, testWelcome.colors.avatar)
                .setDescription(config.replaces_msg_g(member, testWelcome.description), testWelcome.colors.description, 35)
                .setBackground(testWelcome.background.type, testWelcome.background.data)
            let attach = new discord.AttachmentBuilder()
                .setFile(await welcome.get()).setName(`adios_${member.user.id}.png`)
            if (!testWelcome.message) return await channel.send({
                files: [attach]
            }); else await channel.send({
                content: config.replaces_msg_g(member, testWelcome.message),
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
                .setTitle(config.replaces_msg_g(member, testWelcome.title))
                .setThumbnail(member.user.avatar ? member.user.avatarURL({
                    forceStatic: false
                }) : defaultAvatar)
                .setDescription(config.replaces_msg_g(member, testWelcome.description))
                .setTimestamp()
            if (!testWelcome.message) return await channel.send({
                embeds: [embed]
            }); else await channel.send({
                content: config.replaces_msg_g(member, testWelcome.message),
                embeds: [embed],
                allowedMentions: {
                    parse: ['users']
                }
            });
        }
    }
}