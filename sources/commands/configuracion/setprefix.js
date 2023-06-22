const discord = require('discord.js')
const configs = require('../../utils/exports');
const models = require('maplebot_models')
const ms = require('ms')

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    if(!message.member.permissions.has(discord.PermissionFlagsBits.ManageGuild)) return await message.reply({
        embeds: [{
            description: models.utils.statusError('error', `Te falta el permiso de Gestionar Servidor para ejecutar este comando`),
            color: 0xff0000
        }]
    })
    if(!args[0]) return await message.reply({
        embeds: [{
            description: `Debes de escribir un nuevo prefix para la bot\n`,
            color: ff0000
        }]
    })
}

/**
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {

}

exports.help = {
    name: "setprefix",
    alias: ["stprfx", "newprefix"],
    id: "n/a",
    description: "comando para establecer un nuevo prefix a la bot",
    category: "configuracion",
    options: [],
    permissions: {
        user: ["ManageGuild"],
        bot: ["SendMessages"]
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}