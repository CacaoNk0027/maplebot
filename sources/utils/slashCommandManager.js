const discord = require('discord.js')
const interactions_ = require('./assets/interactions.json')

/**
 * @param {discord.Client} client 
 */
exports.SlashManager = async (client) => {
    let commands = await client.application?.commands.set(interactions_)
    console.info(`Se han cargado por lo menos ${commands.size} interacciones`)
    return commands.size;
}