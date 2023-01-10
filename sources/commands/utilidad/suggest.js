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
    name: 'suggestion',
    alias: ['suggest', 'sugerencia', 'sug'],
    id: '031',
    description: 'envia una sugerencia a un canal previamente configurado para sugerencias',
    category: 'utilidad',
    options: [],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks', 'AddReactions']
    },
    status: {
        code: 0,
        reason: 'comando en desarrollo'
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}