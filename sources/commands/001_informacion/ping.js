// importaciones

const discord = require('discord.js')
const models = require('maplebot_models')
const ms = require('ms')

/**
 * exportacion del comando en text command
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        await message.reply({
            content: `> Pong! :ping_pong:\n> shard: \`${Math.floor(client.ws.ping).toString()} ms\`\n> mensajes: \`${(Date.now() - message.createdTimestamp).toString()} ms\``
        })
    } catch (error) {
        await models.utils.error(message, error); console.error(error);
    }
}

/**
 * exportacion del comando en slash command
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {
    try {
        await interaction.reply({
            content: `> Pong! :ping_pong:\n> shard: \`${Math.floor(client.ws.ping).toString()} ms\`\n> mensajes: \`${(Date.now() - interaction.createdTimestamp).toString()} ms\``
        });
    } catch (error) {
        await interactionErrorMsg(interaction, error);
    }
}

/**
 * exportacion del arreglo help
 */
exports.help = {
    // nombre, alias e id del comando
    name: "ping",
    alias: ["latencia", "latency"],
    id: "001",
    // description y categoria del comando
    description: "comando para ver la latencia de la shard y los mensajes",
    category: "información",
    // opciones y permisos
    options: [],
    permissions: {
        user: [],
        bot: ["SendMessages"]
    },
    // configuraciones ( status, es nsfw?, contiene embeds?, cooldown )
    status: {
        code: 1, // codigo 1 es comando en operacion, codigo 0 es comando desabilitado
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}