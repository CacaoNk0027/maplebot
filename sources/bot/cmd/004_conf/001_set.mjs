import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const name = 'set'
const id = '001'

let help = {
    alias: [],
    description: 'Establece sistemas en tu servidor',
    category: '004',
    options: [],
    permissions: {
        bot: [],
        user: []
    },
    inactive: true,
    reason: 'comando en desarrollo, los comandos de configuracion aun se encuentran en desarrollo',
    nsfw: false,
    cooldown: 3
}

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {string[]} args 
 */
async function main(client, message, args) {
    return 0;
}

/**
 * @param {discord.Client} client
 * @param {discord.CommandInteraction} interaction
 */
async function slash(client, interaction) {
    return 0;
}

export {
    name,
    id,
    help,
    main,
    slash
}