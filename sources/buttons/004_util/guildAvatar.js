const discord = require('discord.js')
const config = require('../../utils/exports')
/**
 * @param {discord.Client} client
 * @param {discord.ButtonInteraction} interaction
 */
exports.exec = async (client, interaction) => {
    try {
        let embeds = client.avatars.get(interaction.message.id)
        await interaction.update({
            embeds: [embeds[1]],
            components: [{
                type: discord.ComponentType.ActionRow,
                components: [{
                    type: 2,
                    custom_id: "userAvatar",
                    style: 2,
                    label: "Principal",
                    disabled: false
                }, {
                    type: 2,
                    custom_id: "memberAvatar",
                    style: 1,
                    label: "Servidor",
                    disabled: true
                }]
            }]
        })
    } catch (error) {
        await config.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    customId: "memberAvatar",
    status: {
        code: 1,
        reason: null
    }
}