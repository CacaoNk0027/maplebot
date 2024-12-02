import * as discord from "discord.js"
import * as config from "../config/config.mjs"

const name = "interactionCreate"

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
            content: "Comando inactivo temporalmente"
        })
        return 1
    }
    if(command) {
        await command.exec.slash(client, interaction)
    } else {
        await interaction.reply({
            content: "Ha ocurrido un error al intentar ejecutar el comando, comunicate con el desarrollador",
            ephemeral: true
        })
        return 1
    }
    return 0
}

export {
    name,
    main
}