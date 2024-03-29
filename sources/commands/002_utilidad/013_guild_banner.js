const discord = require('discord.js')

const config = require('../../utils/exports')
const ms = require('ms')

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        if(!message.guild.banner) return await message.reply({
            embeds: [{
                description: config.statusError('rolplayDanger', 'el servidor no cuenta con un banner'),
                color: 0xff0000
            }]
        })
        return await message.reply({
            embeds: [{
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL({ forceStatic: false })
                },
                color: 0xfcf5d4,
                description: `[Guild_Banner URL](${message.guild.bannerURL({ forceStatic: false, size: 2048 })})`,
                image: {
                    url: message.guild.bannerURL({ forceStatic: false, size: 2048 })
                },
                title: `Banner de ${message.guild.name}`
            }]
        })
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
    name: 'guildbanner',
    alias: ['gbanner', 'server_banner', 'serverbanner'],
    id: '013',
    description: 'Muestra un encriptado con el banner del servidor',
    category: 'utilidad',
    options: [],
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