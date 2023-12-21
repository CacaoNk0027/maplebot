const discord = require("discord.js")
const models = require("maplebot_models")
const { AddNewArrayBlacklist, interactionErrorMsg } = require("../../utils/exports")

/**
 * 
 * @param {discord.Client} client 
 * @param {discord.ButtonInteraction} interaction 
 */
exports.exec = async (client, interaction) => {
    try {
        if(await config.schemas.Blacklist.findOne({ guildID: interaction.guildId }) == null) return await interaction.reply({
            embeds: [{ 
                description: models.utils.statusError('error', 'el servidor no cuenta con un sistema de blacklist creado'),
                color: 0xff0000
            }], ephemeral: true
        });
        let palabras = (await config.schemas.Blacklist.findOne({ guildID: interaction.guildId }).exec()).words
        if(palabras.length <= 0) return await interaction.reply({
            embeds: [{
                description: models.utils.statusError('warn', 'que curioso... no hay nada por aqui, solo una blacklist sin palabras establecidas'),
                color: 0xffff00
            }], ephemeral: true
        }); else return await interaction.reply({
            embeds: [{
                author: {
                    name: interaction.guild.name,
                    icon_url: interaction.guild.iconURL({ forceStatic: false })
                },
                color: 0xfcf5d4,
                fields: [{
                    name: 'Palabras prohibidas en el servidor',
                    value: `\`\`\`\n${palabras.join(', ')}\n\`\`\``
                }]
            }], ephemeral: true
        })
    } catch (error) {
        await interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    customId: "blacklist.watchWords",
    status: {
        code: 1,
        reason: null
    }
}