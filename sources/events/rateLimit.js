require('dotenv').config()
const discord = require('discord.js')
const moment = require('moment')
const config = require('../utils/exports')
const webhook = new discord.WebhookClient({
    id: process.env['eventsId'],
    token: process.env['eventsToken']
})

exports.event = {
    name: 'rateLimit',
    /**
     * @param {discord.Client} client
     * @param {discord.RateLimitError} info
     */
    exec: async (client, info) => {
        await webhook.send({
            embeds: [{
                title: 'RateLimit',
                description: `Se me ha dado un limite de velocidad en hacer peticiones <:011:1012749035037261844>`,
                color: config.randomColor(),
                timestamp: new Date(),
                provider: {
                    name: '@Maple bot'
                },
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL({ size: 512, extension: 'png' })
                },
                fields: [{
                    name: 'Informacion',
                    value: `\`\`\`\nMetodo | ${info.method}\nDuracion | ${moment.duration(info.timeToReset).format(`D [Dias], H [Horas], m [Minutos], s [Segundos]`)}\nLimite de peticiones | ${info.limit}\nRuta | ${info.route}\nGlobal? | ${info.global == false ? "no": "si"}\n\`\`\``
                }]
            }]
        })
    }
}