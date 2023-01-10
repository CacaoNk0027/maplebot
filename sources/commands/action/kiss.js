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
        let img_ = await nekoapi.SFW.action_1.kiss()
        const { user, userIsAuthor } = await configs.fetchUser({ message, args });
        if(userIsAuthor() && !args[0]) return await message.reply({
            embeds: [{
                description: models.utils.statusError('rolplay', 'necesitas mencionar o poner la id de alguien mas'),
                color: 0xd9ab93
            }]
        });
        if(userIsAuthor()) return await message.reply({
            embeds: [{
                description: models.utils.statusError('rolplay', 'no puedes besarte a ti mismo... necesitas mencionar a otro usuario'),
                color: 0xd9ab93
            }]
        })
        if(user.id == client.user.id) return await message.reply({
            embeds: [{
                description: models.utils.statusError('rolplayMe', 'no lo siento, no puedes besarme a mi'),
                color: 0xd9ab93
            }]
        })
        return await message.reply({
            embeds: [{
                description: configs._random([
                    `Awww.. **${message.author.username}** le ha dado un beso a **${user.username}**`,
                    `**${user.username}** recibe un beso de **${message.author.username}**`,
                    `**${message.author.username}** le da un calido beso a **${user.username}**`
                ]),
                color: configs.randomColor(),
                image: {
                    url: img_.url
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
    name: 'kiss',
    alias: ['beso'],
    id: '023',
    description: 'dale un beso al amor de tu vida u3u r ~',
    category: 'rolplay',
    options: [{
        name: 'usuario',
        required: true,
    }],
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