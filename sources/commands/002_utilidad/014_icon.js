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
        if(!message.guild.icon) return await message.reply({
            embeds: [{
                description: config.statusError('rolplayDanger', 'el servidor no cuenta con un icono'),
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
                description: `[Guild_Icon URL](${message.guild.iconURL({ forceStatic: false, size: 2048 })})`,
                image: {
                    url: message.guild.iconURL({ forceStatic: false, size: 2048 })
                },
                title: `Icono de ${message.guild.name}`
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
    name: 'icon',
    alias: ['server_icon', 'icono'],
    id: '014',
    description: 'Muestra un encriptado con el icono del servidor',
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