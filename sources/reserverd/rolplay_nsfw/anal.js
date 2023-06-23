const discord = require('discord.js')
const models = require('maplebot_models')
const configs = require('../../utils/exports')
const ms = require('ms')
const nekoapi = require('cacao_nekoapi')

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        
    } catch (error) {
        console.log(error)
        await models.utils.error(message, error);
    }
}

/**
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {
    try {
        
    } catch (error) {
        await configs.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    name: 'anal',
    alias: [],
    id: 'n/a',
    description: 'este comando se usa para lo que dice',
    category: 'rolplay_nsfw',
    options: [{
        name: 'usuario',
        required: true
    }],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks']
    },
    status: {
        code: 0,
        reason: "comando en desarrollo"
    },
    isNsfw: true,
    cooldown: (ms('3s')/1000)
}