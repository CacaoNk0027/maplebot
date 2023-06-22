const discord = require('discord.js')
const models = require('maplebot_models')
const ms = require('ms');
const config = require('../../utils/exports')
const canvacord = require("canvacord")

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        let numero = args[0]
        if (!numero) numero = 6; else {
            if (isNaN(numero)) numero = 6; else {
                if (numero >= 6 && numero <= 1000) numero = Math.floor(numero); else numero = 6;
            }
        }
        let random = Math.floor(Math.random() * numero)
        return await message.reply({
            content: `🎲 | **${message.author.username}** ha tirado un dado de **${numero} caras** y su numero obtenido despues de tirar el dado ha sido **${random == 0? random+1: random}**`
        });
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
    name: "roll",
    alias: ['dado'],
    id: "026",
    description: "tira un dado y prueba tu suerte",
    category: "diversion",
    options: [{
        name: "numero",
        required: false
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