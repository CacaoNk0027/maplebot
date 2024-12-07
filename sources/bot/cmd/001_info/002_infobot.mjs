import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const name = "infobot"
const id = "002"

let help = {
    alias: ["botinfo", "maplebot", "maple", "bot"],
    description: "aprende mas cosas sobre la bot",
    category: "001",
    options: [],
    inactive: true,
    reason: "en desarrollo",
    nsfw: false,
    cooldown: 3
}

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 */
async function no_command(client, message) {
    await message.reply({
        embeds: [{
            title: `Menu de ayuda | ❗📝`,
            author: {
                name: message.author.username,
                icon_url: message.author.avatarURL({ forceStatic: false })
            },
            color: 0xfcf5d4,
            description: `Menu de ayuda | selecciona una categoria del menu para ver los comandos disponibles en la misma\nsi quieres ver categorias nsfw debes de estar en un canal nsfw`,
            footer: {
                text: `Menus de ayuda | ${client.user.username}`,
                icon_url: client.user.avatarURL()
            }
        }],
        components: [{
            type: 1,
            components: [{
                type: 3,
                custom_id: "helpMenu",
                placeholder: "Categorias",
                options: config.menuOptions(message.channel)
            }]
        }]
    })
    return 0
}

/**
 * comando help
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {string[]} args
 */
async function main(client, message, args) {
    let identifier, command

    identifier = args[0].toLowerCase()
    command = client.cmds.get(identifier) ||
        client.cmds.find(cmd => cmd.id == identifier || cmd.help.alias.includes(identifier))
    if(!command) {
        await no_command(client, message);
    } else {

    }
    return 0
}

async function slash(client, interaction) {
    return 0
}

export {
    name,
    id, 
    help,
    main, 
    slash
}