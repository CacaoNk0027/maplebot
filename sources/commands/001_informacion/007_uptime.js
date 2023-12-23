const discord = require('discord.js')

const moment = require('moment')
const config = require('../../utils/exports')
const ms = require('ms')

require('moment-duration-format')(moment)

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        await message.reply({
            embeds: [{
                title: '<:001:1012749015969968138> | Uptime',
                description: `Este es el timepo de actividad que he tenido desde que me inicie por ultima vez`,
                color: 0xffffff,
                fields: [{
                    name: 'Tiempo de actividad',
                    value: `\`\`\`\n${moment.duration(client.uptime).format('W [Semanas] D [Días], H [Horas], m [Minutos], s [Segundos]')}\n\`\`\``
                }],
                author: {
                    name: client.user?.username,
                    icon_url: client.user?.avatarURL()
                }
            }]
        })
    } catch (error) {
        await config.error(message, error)
    }
}

/**
 * @param {discord.Client} client
 * @param {discord.CommandInteraction} interaction
 */
exports.slash = async (client, interaction) => {
    try {
        await interaction.reply({
            embeds: [{
                title: '<:001:1012749015969968138> | Uptime',
                description: `Este es el timepo de actividad que he tenido desde que me inicie por ultima vez`,
                color: 0xffffff,
                fields: [{
                    name: 'Tiempo de actividad',
                    value: `\`\`\`\n${moment.duration(client.uptime).format('W [Semanas] D [Días], H [Horas], m [Minutos], s [Segundos]')}\n\`\`\``
                }],
                author: {
                    name: client.user?.username,
                    icon_url: client.user?.avatarURL()
                }
            }]
        })
    } catch (error) {
        await config.interactionErrorMsg(interaction, error);
    }
}

exports.help = {
    name: 'uptime',
    alias: [],
    id: '007',
    description: 'Ve cuando tiempo he estado encendida',
    category: 'informacion',
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