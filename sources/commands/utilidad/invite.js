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
                description: `hola ${message.author.username}! estare muy agradecida contigo si me invitas a uno de tus servidores ^^\nadicionalmente si quieres puedes tambien unirte al servidor de soporte`,
                title: `Links de invitaciones <:mkMaple_love:836387326552440902>`,
                footer: {
                    text: `Requerido por ${message.author.username}`,
                    icon_url: message.author.avatarURL({ forceStatic: false })
                }
            }],
            components: [{
                type: 1,
                components: [{
                    type: 2,
                    label: "Bot",
                    emoji: '836387326552440902',
                    url: `https://discord.com/oauth2/authorize?client_id=821452429409124451&scope=bot%20applications.commands&permissions=1238334041302`,
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
    name: 'invite',
    alias: ['invitacion'],
    id: '028',
    description: 'Invitame a tus servidores :3',
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