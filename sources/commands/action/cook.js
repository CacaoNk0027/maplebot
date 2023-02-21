const discord = require('discord.js')
const models = require('maplebot_models')
const ms = require('ms')
const configs = require('../../utils/exports')
const nekoapi = require('cacao_nekoapi')

/**
 * @param {discord.Client} client
 * @param {discord.Message} message
 * @param {import('../../../typings').args} args
 */
exports.text = async (client, message, args) => {
    try {
        let image = await nekoapi.SFW.action_1.cook();
        await message.reply({
            embeds: [{
                description: configs._random([
                    `**${message.author.username}** se ha puesto a cocinar algo delicioso ~`,
                    `**${message.author.username}** se pone el delantal para cocinar`,
                    `**${message.author.username}** ha sacado su chef interno y cocina`
                ]),
                color: configs.randomColor(),
                image: {
                    url: image.url
                }
            }]
        })
    } catch (error) {
        console.error(error)
        await models.utils.error(message, error)
    }
}

/**
 * @param {discord.Client} client
 * @param {discord.CommandInteraction} interaction
 */
exports.slash = async (client, interaction) => {
    try {
        
    } catch (error) {
        console.error(error)
        await configs.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    name: 'cook',
    alias: ['cocinar'],
    id: '033',
    description: 'cocina algo delicioso',
    category: 'rolplay',
    options: [],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks'],
    },
    status: {
        code: 1,
        reason: null,
    },
    isNsfw: false,
    cooldown: (ms('3s')/1000)
}