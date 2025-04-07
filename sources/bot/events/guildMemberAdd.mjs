import * as discord from 'discord.js'
import * as config from '../config/config.mjs'
import neekuro from 'neekuro'

const name = 'guildMemberAdd'

/**
 * @param {discord.Client} client 
 * @param {discord.GuildMember} member 
 */
async function main(client, member) {
    let channelId = (await config.Channels.findOne({ guildId: member.guild.id }))?.welcomeId
    let server_db = await config.Welcome.findOne({ guildId: member.guild.id })
    let welcome = null
    let channel = null

    if (!server_db) return

    try {
        channel = await client.channels.fetch(channelId) || null

        if (!channel) return

        if (server_db.isEmbed) {
            welcome = new discord.EmbedBuilder()
                .setAuthor({
                    name: member.user.globalName || member.user.username,
                    iconURL: member.user.avatarURL({ forceStatic: false })
                })

            if (server_db.background?.type == 'color') {
                welcome.setColor(parseInt(server_db.background?.value.replace('#', ''), 16))
            } else {
                welcome.setColor(config.random_color())
                    .setImage(server_db.background?.value)
            }

            welcome.setDescription(config.text_wl_vars(server_db.description, {
                user: member.user.globalName || member.user.username,
                server: member.guild.name,
                count: member.guild.memberCount
            }))
                .setFooter({
                    text: member.guild.name,
                    iconURL: member.guild.iconURL({ forceStatic: false })
                })
                .setTitle(config.text_wl_vars(server_db.title, {
                    user: member.user.globalName || member.user.username,
                    server: member.guild.name,
                    count: member.guild.memberCount
                }))


            await channel.send({
                content: config.text_wl_vars(server_db.message, {
                    user: member.user.globalName || member.user.username,
                    server: member.guild.name,
                    count: member.guild.memberCount,
                    mention: `<@${member.user.id}>`
                }),
                embeds: [welcome],
                allowedMentions: {
                    parse: ['users']
                }
            })

            return 0
        }

        welcome = new neekuro.Welcome()
            .setAvatar(member.user.avatarURL({ extension: 'png' }), {
                border: server_db.colors?.border
            })
            .setBackground(server_db.background?.type, server_db.background?.value)
            .setDescription(config.text_wl_vars(server_db.description, {
                user: member.user.globalName || member.user.username,
                server: member.guild.name,
                count: member.guild.memberCount
            }), {
                text_color: server_db.colors?.description
            })
            .setTitle(config.text_wl_vars(server_db.title, {
                user: member.user.globalName || member.user.username,
                server: member.guild.name,
                count: member.guild.memberCount
            }), {
                text_color: server_db.colors?.title
            })

        welcome = new discord.AttachmentBuilder()
            .setDescription(`@Maple Bot | Imagen de bienvenida para ${member.user.username}`)
            .setName('welcome.png')
            .setFile(await welcome.build())

        await channel.send({
            content: config.text_wl_vars(server_db.message, {
                user: member.user.globalName || member.user.username,
                server: member.guild.name,
                count: member.guild.memberCount,
                mention: `<@${member.user.id}>`
            }),
            files: [welcome],
            allowedMentions: {
                parse: ['users']
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export {
    name,
    main
}