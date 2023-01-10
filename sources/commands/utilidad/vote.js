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
        return await message.reply({
            embeds: [{
                author: {
                    name: client.user.username, 
                    icon_url: client.user.avatarURL()
                },
                color: 0xfcf5d4,
                description: `hola ${message.author.username}! gracias por votar por mi en top.gg, puedes dejar una opinion sobre mi si gustas ^^\nadicionalmente si quieres puedes tambien unirte al servidor de soporte`,
                title: `Votar <:mkMaple_love:836387326552440902>`,
                footer: {
                    text: `Requerido por ${message.author.username}`,
                    icon_url: message.author.avatarURL({ forceStatic: false })
                }
            }],
            components: [{
                type: 1,
                components: [{
                    type: 2,
                    label: "Votar",
                    emoji: '836387326552440902',
                    url: `https://top.gg/bot/821452429409124451/vote`,
                    style: 5
                }, {
                    type: 2,
                    label: "Servidor",
                    emoji: '888237981830357042',
                    url: `https://discord.gg/PKGhvUKaQN`,
                    style: 5
                }]
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
    name: 'vote',
    alias: ['votar'],
    id: '030',
    description: 'vota por mi en top.gg :3',
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