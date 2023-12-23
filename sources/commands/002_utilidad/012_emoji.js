const discord = require('discord.js')

const ms = require('ms')
const config = require('../../utils/exports')
const emoji_regex = require('emoji-regex')()

/**
 * @param {discord.Client} client
 * @param {discord.Message} message
 * @param {import('../../../typings').args} args
 */
exports.text = async (client, message, args) => {
    try {
        if(!args[0]) return await message.reply({
            embeds: [{ description: config.statusError('error', "no haz colocado ningun emoji"), color: 0xff0000 }]
        }); else if(emoji_regex.test(args[0])) return await message.reply({
            embeds: [{ description: config.statusError('error', "el emoji debe de ser personalizado no preterminado" ), color: 0xff0000 }]
        }); else if(!args[0].match(/<a:.+?:\d{19}>|<:.+?:\d{19}>|<a:.+?:\d{18}>|<:.+?:\d{18}>/g)) return await message.reply({
            embeds: [{ description: config.statusError('error', "no se ha detectado ningun emoji"), color: 0xff0000 }]
        }); else {
            let dataEmj = discord.parseEmoji(args[0]);
            if(!dataEmj.id) return await message.reply({
                embeds: [{description: config.statusError('error', "no se ha detectado ningun emoji"), color: 0xff0000}]
            }); else {
                await message.reply({
                    content: `https://cdn.discordapp.com/emojis/${dataEmj.id}.${dataEmj.animated ? "gif": "png"}` 
                })
            }
        }
    } catch (error) {
        console.error(error)
        await config.error(message, error)
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
        await config.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    name: 'emoji',
    alias: ['amplify', 'emote'],
    id: '012',
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