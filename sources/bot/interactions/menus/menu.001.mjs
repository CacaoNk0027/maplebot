import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const id = 'menu.001'
const isUnique = true

/**
 * @param {discord.Client} client 
 * @param {discord.AnySelectMenuInteraction} interaction 
 * @param {discord.Message} message
 */
async function main(client, interaction, message) {
    let identifier = interaction.values.shift()
    let category = config.help_menu.find(category => category.id == identifier)
    let embed = new discord.EmbedBuilder(message.embeds.shift().data)

    embed.setTitle(`${category.emoji} | ${category.name}`)
    .setDescription(category.description)
    .setFields([{
        name: 'Comandos',
        value: config.text_field_commmands(config.prefix, client.cmds, category.id)
    }])

    await message.edit({
        embeds: [embed]
    }).then(async () => {
        await interaction.deferUpdate()
    }).catch(async error => {
        console.error(error)
        await interaction.reply({
            content: 'Ha ocurrido un error interno al editar el menu, comunicate con el desarrollador',
            ephemeral: true
        })
    })

    return 0
}

export {
    id,
    isUnique,
    main
}