import * as discord from 'discord.js'
import __package from '../../../package.json' assert { type: 'json' }
import __jinterc from '../assets/interactions.json' assert { type: 'json' }

const prefix = "m!"

let default_client_permissions = [
    discord.PermissionFlagsBits.SendMessages,
    discord.PermissionFlagsBits.EmbedLinks,
    discord.PermissionFlagsBits.ReadMessageHistory
]

function random_color() {
    let array = Object.entries(discord.Colors).map(([_, num]) => num)
    return array[Math.floor(Math.random() * array.length)]
}

/**
 * @param {discord.Client} client
 */
async function slash_manager(client) {
    let commands
    try {
        commands = await client.application?.commands.set(__jinterc)
        console.info(`Total de interacciones cargadas:`, commands.size)
    } catch (error) {
        console.error(error)
    }
    return 0
}

/**
 * valida una id y devuelve un booleano
 * @param {string} id 
 */
function allowed_id(id) {
    let id_list = [ "801603753631285308" ]
    return id_list.includes(id)
}

export {
    prefix,
    __package,
    default_client_permissions,
    random_color,
    slash_manager,
    allowed_id
}