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
        if (user.banner == null && user.accentColor == null) return await message.reply({
            embeds: [{
                description: models.utils.statusError('rolplayDanger', userIsAuthor() ? `Whoops... parece que no tienes un banner o un color personalizado` : `Whoops... ${user.username} no cuenta con un banner o un color personalizado`),
                color: 0xff0000
            }]
        })
        if (user.banner == null && user.accentColor) {
            let image = await config.newColorImage(user.hexAccentColor)
            return await message.reply({
                embeds: [{
                    author: {
                        name: message.author.username,
                        icon_url: message.author.avatarURL({ forceStatic: false })
                    },
                    color: user.accentColor,
                    description: userIsAuthor() ? `Parece que no cuentas con un banner, pero si con un color personalizado` : `Parece que **${user.username}** no cuenta con un banner, pero si con un color personalizado`,
                    footer: {
                        text: `color ${user.hexAccentColor}`
                    },
                    image: {
                        url: image.embedUrl
                    },
                    title: userIsAuthor() ? 'Tu color de banner': `Color de banner de ${user.username}`
                }],
                files: [image.attachment]
            })
        }
        if(user.banner) return await message.reply({
            embeds: [{
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL({ forceStatic: false })
                },
                color: 0xfcf5d4,
                description: `[Banner URL](${user.bannerURL({ forceStatic: false, size: 2048 })})`,
                image: {
                    url: user.bannerURL({ forceStatic: false, size: 2048 })
                },
                title: userIsAuthor() ? 'Tu banner': `Banner de ${user.username}`
            }]
        })
    } catch (error) {
        console.error(error)
        await models.utils.error(message, error)
    }
}

exports.slash = async (client, interaction) => {
    try {

    } catch (error) {
        await config.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    name: 'banner',
    alias: ['fondo'],
    id: '010',
    description: 'Muestra un encriptado con el banner de un usuario o el tuyo',
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