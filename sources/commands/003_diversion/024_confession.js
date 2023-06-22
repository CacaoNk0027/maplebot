const discord = require('discord.js')
const models = require('maplebot_models')
const ms = require('ms');

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {

    } catch (error) {
        await models.utils.error(message, error)
    }
}

/**
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {

}

exports.help = {
    name: "confession",
    alias: ['confesion', 'confess'],
    id: "024",
    description: "envia una confesion a un canal previamente establecido",
    category: "diversion",
    options: [{
        name: "texto",
        required: true
    }, {
        name: "-d",
        required: false
    }],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks', 'AttachFiles']
    },
    status: {
        code: 0,
        reason: "comando en desarrollo"
    },
    isNsfw: false,
    cooldown: (ms('3ms') / 1000)
}