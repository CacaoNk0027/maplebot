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
        const { user, userIsAuthor } = await configs.fetchUser({ message, args })
        let image = await nekoapi.SFW.action_1.camp()
        if(userIsAuthor() && !args[0] && userIsAuthor() && args[0]) return await message.reply({
            embeds: [{
                color: configs.randomColor(),
                description: configs._random([
                    `**${message.author.username}** ha alistado las maletas para ir a acampar`,
                    `**${message.author.username}** fue de campamento`,
                    `**${message.author.username}** ha salido a un dia de campamento`
                ]),
                image: {
                    url: image.url
                }
            }]
        })
        if(user.id == client.user.id) return await message.reply({
            embeds: [{
                color: configs.randomColor(),
                description: `no es que me moleste, pero deberias de acampar con alguien mas, de igual manera, te acompaño!`,
                image: {
                    url: image.url
                }
            }]
        })
        if(!userIsAuthor()) return await message.reply({
            embeds: [{
                color: configs.randomColor(),
                description: configs._random([
                    `**${message.author.username}** ha pasado un dia de campamento con **${user.username}**`,
                    // `**${}**`
                ])
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