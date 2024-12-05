import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const name = "ping"
const id = "001"

let help = {
    alias: [],
    description: "comando para saber el ping de la bot",
    category: "001",
    options: [],
    permissions: {
        user: [],
        bot: []
    },
    inactive: false,
    reason: null,
    nsfw: false,
    cooldown: 3
}

/**
 * Comando ping
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {string[]} args 
 */
async function main(client, message, args) {
    await message.reply({
        embeds: [{
            color: config.random_color(),
            description: "Calculando..."
        }]
    }).then(async (response) => {
        response.edit({
            embeds: [{
                color: config.random_color(),
                author: {
                    name: `Pong! 🏓`
                },
                description: `\`\`\`\nCliente: ${Math.floor(client.ws.ping)}\nMensajes: ${(response.createdTimestamp - message.createdTimestamp)}\n\`\`\``
            }]
        })
    })

    return 0
}

/**
 * Comando ping slash
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
async function slash(client, interaction) {
    await interaction.reply({
        embeds: [{
            color: config.random_color(),
            description: "Calculando..."
        }]
    }).then(async (response) => {
        response.edit({
            embeds: [{
                color: config.random_color(),
                author: {
                    name: `Pong! 🏓`
                },
                description: `\`\`\`\nCliente: ${Math.floor(client.ws.ping)}\nMensajes: ${(response.createdTimestamp - interaction.createdTimestamp)}\n\`\`\``
            }]
        })
    })
    return 0
}

export {
    name,
    id,
    help,
    main,
    slash
}