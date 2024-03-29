const discord = require('discord.js')
const config = require('../../utils/exports')
/**
 * @param {discord.Client} client
 * @param {discord.ButtonInteraction} interaction
 */
exports.exec = async (client, interaction) => {
    try {
        await interaction.update({
            components: [{
                type: 1,
                components: [{
                    customId: "arrowLeft",
                    style: 3,
                    label: "«",
                    type: 2,
                    disabled: true
                }, {
                    customId: "buttonStop",
                    style: 4,
                    label: "x",
                    type: 2,
                    disabled: true
                }, {
                    customId: "arrowRight",
                    style: 3,
                    label: "»",
                    type: 2,
                    disabled: true
                }]
            }]
        })
        client.chbnroles_pages.delete(interaction.message.id)
    } catch (error) {
        await config.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    customId: "buttonStop",
    status: {
        code: 1,
        reason: null
    }
}