const discord = require('discord.js')
const models = require('maplebot_models')
const ms = require('ms');
const figlet = require('figlet')
const regexp =  require('emoji-regex')

let emoji_regex = regexp();

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        if(!args.join(' ') || args.join(' ').length <= 0) return await message.reply({ embeds: [{
            description: models.utils.statusError('error', 'Debes de escribir un texto'), color: 0xff0000
        }] }); else if(args.join(' ').length > 15) return await message.reply({ embeds: [{
            description: models.utils.statusError('error', 'el texto que haz escrito no puede superar los 15 caracteres'), color: 0xff0000
        }] }); else if(emoji_regex.test(args.join(' '))) return await message.reply({ embeds: [{
            description: models.utils.statusError('error', 'el texto no puede contener emojis'), color: 0xff0000
        }] }); else {
            figlet(args.join(' '), async (error, result) => {
                if(error) throw error;
                return await message.reply({ 
                    embeds: [{ description: `\`\`\`\n${result}\n\`\`\``, color: 0xfcf5d4 }] 
                })
            })
        }
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
    name: "ascii",
    alias: [],
    id: "022",
    description: "genera un texto ascii",
    category: "diversion",
    options: [{
        name: "texto",
        required: true
    }],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks']
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3ms') / 1000)
}