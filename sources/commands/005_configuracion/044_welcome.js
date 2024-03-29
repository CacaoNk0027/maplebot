const discord = require('discord.js')

const ms = require('ms')

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {

}

/**
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {
    
}

exports.help = {
    name: "welcome",
    alias: ["bienvenidas"],
    id: "044",
    description: "comando para establecer un sistema de bienvenidas",
    category: "configuracion",
    options: [],
    permissions: {
        user: ["ManageChannels"],
        bot: ["SendMessages", "AttachFiles"]
    },
    status: {
        code: 0,
        reason: `Usa el comando de barra /set para establecer un sistema de bienvenidas`
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}