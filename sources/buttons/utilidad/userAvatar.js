const discord = require('discord.js')
const configs = require('../../utils/exports')

/**
 * @param {discord.Client} client
 * @param {discord.ButtonInteraction} interaction
 */
exports.exec = async (client, interaction) => {
    try {
        let embeds = client.avatars.get(interaction.message.id)
        await interaction.update({
            embeds: [embeds[0]],
            components: [{
                type: discord.ComponentType.ActionRow,
                components: [{
                    type: 2,
                    custom_id: "userAvatar",
                    style: 1,
                    label: "Principal",
                    disabled: true
                }, {
                    type: 2,
                    custom_id: "memberAvatar",
                    style: 2,
                    label: "Servidor",
                    disabled: false
                }]
            }]
        })
    } catch (error) {
        await configs.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    customId: "userAvatar",
    status: {
        code: 1,
        reason: null
    }
}