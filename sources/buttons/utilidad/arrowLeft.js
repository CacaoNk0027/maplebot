const discord = require('discord.js')
const configs = require('../../utils/exports')
/**
 * @param {discord.Client} client
 * @param {discord.ButtonInteraction} interaction
 */
exports.exec = async (client, interaction) => {
    try {
        let { pages, index } = client.channels_pages.get(interaction.message.id)
        client.channels_pages.set(interaction.message.id, { index: index-1, pages: pages })
        await interaction.update({
            embeds: [pages[index-2]],
            components: [{
                type: 1,
                components: [{
                    customId: "arrowLeft",
                    style: 3,
                    label: "«",
                    type: 2,
                    disabled: index == 2
                }, {
                    customId: "buttonStop",
                    style: 4,
                    label: "x",
                    type: 2
                }, {
                    customId: "arrowRight",
                    style: 3,
                    label: "»",
                    type: 2,
                    disabled: index-1 == pages.length
                }]
            }]
        })
    } catch (error) {
        await configs.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    customId: "arrowLeft",
    status: {
        code: 1,
        reason: null
    }
}