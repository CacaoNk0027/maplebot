const discord = require('discord.js')

const config = require('../../utils/exports')
/**
 * @param {discord.Client} client
 * @param {discord.ButtonInteraction} interaction
 */
exports.exec = async (client, interaction) => {
    try {
        await interaction.reply({
            embeds: [{
                title: "parametros de texto",
                author: {
                    name: interaction.user.username,
                    icon_url: interaction.user.avatarURL({ forceStatic: false })
                },
                description: `para poner un parametro en el mensaje lo unico que debes hacer es poner el parametro rodeado de las llaves un ejemplo seria...\n\nHola **{user}**!\n\nnota: es recomendable usar los parametros en mayuscula completo o en minuscula completo para evitar fallos de deteccion`,
                color: config.randomColor(),
                fields: [{
                    name: "Guild",
                    value: "agrega el nombre del servidor en el texto",
                    inline: true
                }, {
                    name: "User",
                    value: "Agrega el nombre del usuario que entra al servidor",
                    inline: true
                }, {
                    name: "UserTag",
                    value: "Agrega el nombre y el tag del usuario que entra al servidor",
                    inline: true
                }, {
                    name: "Tag",
                    value: "Agrega el tag del usuario que entra al servidor",
                    inline: true
                }, {
                    name: "Number",
                    value: "Agrega el numero de miembros actuales del servidor",
                    inline: true
                }, {
                    name: "Mention",
                    value: "Agrega una mencion para el usuario que entra al servidor",
                    inline: true
                }]
            }],
            ephemeral: true
        })
    } catch (error) {
        await config.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    customId: "set.welcome.params",
    status: {
        code: 1,
        reason: null
    }
}