const discord = require('discord.js')
const models = require('maplebot_models')
const ms = require('ms')
const { Welcome } = require('./slashClases/welcome')

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        return await message.reply({
            content: models.utils.statusError("warn", "este comando solo complementa a los comandos de barra")
        })
    } catch (error) {
        await models.utils.error(message, error); console.error(error);
    }
}

/**
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {
    try {
        switch(interaction.options._group) {
            case "welcome":
                Welcome(client, interaction)
                break;
            default:
                return interaction.reply({ content: "deberias de probar el nuevo comando /set welcome :3" })
        }
    } catch (error) {
        await interactionErrorMsg(interaction, error);
    }
}

exports.help = {
    name: "set",
    alias: ["set"],
    id: "s_001",
    description: "comando complementario para los comandos de barra",
    category: "configuracion",
    options: [],
    permissions: {
        user: ["ManageChannels"],
        bot: ["SendMessages", "AttachFiles"]
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}