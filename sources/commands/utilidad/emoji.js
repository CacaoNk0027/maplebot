const discord = require('discord.js')
const models = require('maplebot_models')
const ms = require('ms')
const configs = require('../../utils/exports')
const emoji_regex = require('emoji-regex')()

/**
 * @param {discord.Client} client
 * @param {discord.Message} message
 * @param {import('../../../typings').args} args
 */
exports.text = async (client, message, args) => {
    try {
        if(!args[0]) return await message.reply({
            embeds: [{ description: models.utils.statusError('error', "no haz colocado ningun emoji"), color: 0xff0000 }]
        }); else if(emoji_regex.test(args[0])) return await message.reply({
            embeds: [{ description: models.utils.statusError('error', "el emoji debe de ser personalizado no preterminado" ), color: 0xff0000 }]
        }); else if(!args[0].match(/<a:.+?:\d{19}>|<:.+?:\d{19}>|<a:.+?:\d{18}>|<:.+?:\d{18}>/g)) return await message.reply({
            embeds: [{ description: models.utils.statusError('error', "no se ha detectado ningun emoji"), color: 0xff0000 }]
        }); else {
            let dataEmj = discord.parseEmoji(args[0]);
            if(!dataEmj.id) return await message.reply({
                embeds: [{description: models.utils.statusError('error', "no se ha detectado ningun emoji"), color: 0xff0000}]
            }); else {
                await message.reply({
                    content: `https://cdn.discordapp.com/emojis/${dataEmj.id}.${dataEmj.animated ? "gif": "png"}` 
                })
            }
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
    name: 'emoji',
    alias: ['amplify', 'emote'],
    id: '025',
    description: 'amplia la imagen de un emoji',
    category: 'utilidad',
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
    cooldown: (ms('3s') / 1000)
}