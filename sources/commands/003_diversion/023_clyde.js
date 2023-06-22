const discord = require('discord.js')
const models = require('maplebot_models')
const ms = require('ms');
const canvacord = require('canvacord')

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        if(!args.join(' ') || args.join(' ').length <= 0) return await message.reply({ embeds: [{
            description: models.utils.statusError('error', 'debes de escribir un texto'), color: 0xff0000
        }] }); else return await message.reply({
            embeds: [{
                color: 0xfcf5d4,
                image: {
                    url: 'attachment://clyde.png'
                }
            }],
            files: [new discord.AttachmentBuilder().setName('clyde.png').setDescription('imagen de clyde "hablando" @Maple Bot').setFile((await canvacord.Canvacord.clyde(args.join(' '))))]
        })
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
    name: "clyde",
    alias: ['clydebot'],
    id: "023",
    description: "haz \"hablar\" al bot de discord",
    category: "diversion",
    options: [{
        name: "texto",
        required: true
    }],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks', 'AttachFiles']
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3ms') / 1000)
}