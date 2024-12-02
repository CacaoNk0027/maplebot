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
        bot:  []
    },
    inactive: false,
    reason: "none",
    nsfw: true,
    cooldown: 3
}

/**
 * Comando ping
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {string[]} args 
 */
async function main(client, message, args) {
    let wsping, msgping

    wsping = Math.floor(client.ws.ping)
    msgping = Date.now() - message.createdTimestamp

    await message.reply({
        embeds: [{
            color: config.random_color(),
            author: {
                name: `Pong! 🏓`
            },
            description: `\`\`\`\nCliente: ${wsping}\nMensajes: ${msgping}\n\`\`\``
        }]
    }) 

    return 0
}

/**
 * Comando ping slash
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
async function slash(client, interaction) {
    let wsping, msgping

    wsping = Math.floor(client.ws.ping)
    msgping = Date.now() - interaction.createdTimestamp

    await interaction.reply({
        embeds: [{
            color: config.random_color(),
            author: {
                name: `Pong! 🏓`
            },
            description: `\`\`\`\nCliente: ${wsping}\nInteraccion: ${msgping}\n\`\`\``
        }]
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