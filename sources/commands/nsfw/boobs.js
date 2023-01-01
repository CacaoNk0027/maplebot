const discord = require('discord.js')
const { args } = require('../../typings/index')
const models = require('maplebot_models')
const configs = require('../../utils/exports')
const nekoapi = require('cacao_nekoapi')
const ms = require('ms')

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {args} args 
 */
exports.text = async (client, message, args) => {
    try {
        let img = (await nekoapi.NSFW.nsfw.boobs())
        await message.reply({
            embeds: [{
                color: configs.randomColor,
                description: "...",
                image: {
                    url: img.url
                }
            }]
        })
    } catch (error) {
        await models.utils.error(message, error)
        console.error(error)
    }
}

/**
 * @param {discord.Client} client 
 * @param {discord.Interaction} interaction 
 */
exports.slash = async (client, interaction) => {
    try {

    } catch (error) {
        await configs.interactionErrorMsg(interaction, error);
    }
}

exports.help = {
    name: "boobs",
    alias: [],
    id: "005",
    description: "simplemente boobs...",
    category: "nsfw",
    options: [],
    permissions: {
        user: [],
        bot: ["SendMessages", "EmbedLinks"]
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: true,
    cooldown: (ms('3s')/1000)
}