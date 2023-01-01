const discord = require('discord.js')
const { args } = require('../../typings/index.d.ts')
const models = require('maplebot_models')
const ms = require('ms')
const configs = require('../../utils/exports')
const nekoapi = require('cacao_nekoapi')

/**
 * @param {discord.Client} client
 * @param {discord.Message} message
 * @param {args} args
 */
exports.text = async (client, message, args) => {
    try {
        let img_ = await nekoapi.SFW.action_1.camp()
        const onlyAuthor = () => message.reply({
            embeds: [{
                color: configs.randomColor,
                description: configs._random([
                    `**${message.author.username}** ha salido de campamento UwU`,
                    `**${message.author.username}** ha empacado la mochila -w-)--b`,
                    `la aventura asecha a **${message.author.username}** -.-`
                ])
            }]
        })
        if(!args[0]) return onlyAuthor();
        let friend; try {
            friend = await message.guild.members.fetch({});
        } catch (err) {
            return onlyAuthor();
        }
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
    name: 'camp',
    alias: ['acampar'],
    id: '015',
    description: 'sal a acampar :3',
    category: 'rolplay',
    options: [{
        name: 'usuario',
        required: false,
    }],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks'],
    },
    status: {
        code: 0,
        reason: "comando en desarrollo",
    },
    isNsfw: false,
    cooldown: (ms('3s')/1000)
}