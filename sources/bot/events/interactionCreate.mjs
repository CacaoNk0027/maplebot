import * as discord from 'discord.js'
import * as config from '../config/config.mjs'

const name = 'interactionCreate'

/**
 * para el evento principal
 * @param {discord.client} client 
 * @param {discord.CommandInteraction | discord.ButtonInteraction} interaction 
 */
async function main(client, interaction) {
    if(interaction.type == discord.InteractionType.ApplicationCommand) {
        slash(client, interaction)
        return 0
    }
    if(interaction.type == discord.InteractionType.MessageComponent && interaction.isAnySelectMenu()) {
        select_menu(client, interaction)
        return 0
    }
    return 0
}

/**
 * para los comandos de barra
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
async function slash(client, interaction) {
    let command = client.cmds.get(interaction.commandName)
    if(command.inactive && !config.allowed_id(interaction.user.id)) {
        await interaction.reply({
            ephemeral: true,
            content: 'Comando inactivo temporalmente'
        })
        return 1
    }
    if(command) {
        await command.exec.slash(client, interaction)
    } else {
        await interaction.reply({
            content: 'Ha ocurrido un error al intentar ejecutar el comando, comunicate con el desarrollador',
            ephemeral: true
        })
        return 1
    }
    return 0
}

/**
 * @param {discord.Client} client 
 * @param {discord.AnySelectMenuInteraction} interaction 
 */
async function select_menu(client, interaction) {
    let menu, message 
    menu = client.interactions.filter(target => target.id.split('.').shift() == 'menu').get(interaction.customId)
    message = interaction.message
    if(!menu) {
        await interaction.reply({
            content: 'Ha ocurrido un error interno en el menu, comunicate con el desarrollador',
            ephemeral: true
        })
        return 1
    } else {
        menu.main(client, interaction, message);
    }
    return 0;
}

export {
    name,
    main
}