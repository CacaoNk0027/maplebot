// importaciones

const discord = require('discord.js')
const package_json = require('../../package.json')
const configs = require('../utils/exports.js')
const { SlashManager } = require('../utils/slashCommandManager')

// exportacion de arreglo con nombre y funcion del evento

exports.event = {
    // nombre
    name: "ready",
    /**
     * funcion principal para la ejecicion del evento
     * @param {discord.Client} client 
     */
    exec: async (client) => {
        client.user.setPresence({
            status: 'dnd',
            activities: [{
                name: `@Maple bot 🍁 | ${package_json.version} | ${configs._random(await configs.presences(client))}`
            }]
        })
        SlashManager(client);
    	console.info(`El cliente se ha iniciado correctamente como: ${client.user.username}`)
    }
}