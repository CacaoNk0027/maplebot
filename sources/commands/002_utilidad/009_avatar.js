const discord = require('discord.js')
const models = require('maplebot_models')
const config = require('../../utils/exports')
const ms = require('ms')

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        const { user, userIsAuthor } = await config.fetchUser({ message: message, args: args })
        const { member, memberIsAuthor } = await config.fetchMember({ message: message, id: user.id })
        const embeds = [{
            title: userIsAuthor() ? 'Tu avatar' : `Avatar de ${user.username}`,
            description: `[Avatar URL](${user.avatarURL({ forceStatic: false, size: 2048 })})`,
            color: config.randomColor(),
            author: {
                name: user.username,
                icon_url: user.avatarURL({ forceStatic: false })
            },
            image: {
                url: user.avatarURL({ forceStatic: false, size: 2048 })
            }
        }]
        if (member !== null && member.avatar !== null) embeds.push({
            title: memberIsAuthor() ? 'Tu avatar de servidor' : `Avatar de ${member.user.username}`,
            description: `[GuildAvatar URL](${member.avatarURL({ forceStatic: false, size: 2048 })})`,
            color: config.randomColor(),
            author: {
                name: member.user.username,
                icon_url: member.avatarURL({ forceStatic: false })
            },
            image: {
                url: member.avatarURL({ forceStatic: false, size: 2048 })
            }
        });
        let msg = await message.reply({
            embeds: [embeds[0]],
            components: [{
                type: discord.ComponentType.ActionRow,
                components: embeds.length > 1 ? [{
                    type: 2,
                    custom_id: "userAvatar",
                    style: 1,
                    label: "Principal",
                    disabled: true
                }, {
                    type: 2,
                    custom_id: "memberAvatar",
                    style: 2,
                    label: "Servidor",
                    disabled: false
                }] : [{
                    type: 2,
                    custom_id: "avatar_user",
                    style: 1,
                    label: "Principal",
                    disabled: true
                }]
            }]
        })
        client.avatars.set(msg.id, embeds)
        setTimeout(async () => {
            embeds.length > 1 ? await msg.edit({
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        custom_id: "userAvatar",
                        style: 2,
                        label: "Principal",
                        disabled: true
                    }, {
                        type: 2,
                        custom_id: "memberAvatar",
                        style: 2,
                        label: "Servidor",
                        disabled: true
                    }]
                }]
            }): () => {};
            client.avatars.delete(msg.id)
        }, ms('30s'));
    } catch (error) {
        console.error(error)
        await config.error(message, error)
    }
}

exports.slash = async (client, interaction) => {
    try {

    } catch (error) {
        await config.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    name: 'avatar',
    alias: ['pfp'],
    id: '009',
    description: 'Muestra un encriptado con tu avatar o el de otro usuario',
    category: 'utilidad',
    options: [{
        name: 'usuario',
        required: false
    }],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks']
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}