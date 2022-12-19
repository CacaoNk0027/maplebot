// importaciones

const discord = require('discord.js')
const configs = require('../../utils/exports')
const models = require('maplebot_models')
const ms = require('ms')

/**
 * exportacion del comando en text command
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {string[]} args 
 */
exports.text = async (client, message, args) => {
    try {
        
    } catch (error) {
        await models.utils.error(message, error); console.error(error);
    }
}

/**
 * exportacion del comando en slash command
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {
    try {
        
    } catch (error) {
        await interactionErrorMsg(interaction, error);
    }
}

/**
 * exportacion del arreglo help
 */
exports.help = {
    // nombre, alias e id del comando
    name: "infobot",
    alias: ["botinfo", "maplebot"],
    id: "003",
    // description y categoria del comando
    description: "aprende mas sobre mi",
    category: "información",
    // opciones y permisos
    options: [],
    permissions: {
        user: [],
        bot: ["SendMessages", "EmbedLinks"],
    },
    // configuraciones ( status, es nsfw?, contiene embeds?, cooldown )
    status: {
        code: 1, // codigo 1 es comando en operacion, codigo 0 es comando desabilitado
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}