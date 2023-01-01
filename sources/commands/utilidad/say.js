const discord = require('discord.js')
const models = require('maplebot_models')
const ms = require('ms')
const configs = require('../../utils/exports')

/**
 * @param {discord.Client} client
 * @param {discord.Message} message
 * @param {args} args
 */
exports.text = async (client, message, args) => {
    try {
        if(!args[0]) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', 'es necesario poner algun texto en el parametro <texto>'),
                color: 0xff0000
            }]
        })
        if(!args.length <= 100) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', 'el texto colocado no puerde revasar las 100 palabras'),
                color: 0xff0000
            }]
        })
        if(message.type == discord.MessageType.Reply) await (await message.channel.messages.fetch(message.reference.messageId)).reply({
            content: args.join(' ')
        }).then(async () => await message.delete()).catch(error => error); else await message.channel.send({
            content: args.join(' ')
        }).then(async () => await message.delete().catch(error => error));
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
    name: 'say',
    alias: ['decir'],
    id: '016',
    description: 'hazme hablar por ti OWO',
    category: 'utilidad',
    options: [{
        name: 'texto',
        required: true,
    }],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks', 'ManageMessages'],
    },
    status: {
        code: 1,
        reason: null,
    },
    isNsfw: false,
    cooldown: (ms('3s')/1000)
}