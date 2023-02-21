const discord = require('discord.js')
const models = require('maplebot_models')
const ms = require('ms')

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    // try {
    //     if(!args[0])
    // } catch (e) { await models.utils.error(message, e) }
}

/**
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {

}

exports.help = {
    name: "8ball",
    alias: [],
    id: "035",
    description: "preguntame algo para que lo responda",
    category: "diversion",
    options: [{
        name: "pregunta",
        required: true
    }],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks']
    },
    status: {
        code: 0,
        reason: "comando en desarrollo "
    },
    isNsfw: false,
    cooldown: (ms('3ms')/1000)
}