import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

import * as cmd_welcome from './002_welcome.mjs' 
import * as cmd_prefix from './003_prefix.mjs'

const name = 'set'
const id = '001'

let help = {
    alias: [],
    description: 'Establece sistemas en tu servidor',
    category: '004',
    options: [{
        name: cmd_prefix.name,
        alias: cmd_prefix.help.alias,
        description: cmd_prefix.help.description,
        required: false,
        options: cmd_prefix.help.options
    }, {
        name: cmd_welcome.name,
        alias: cmd_welcome.help.alias,
        description: cmd_welcome.help.description,
        required: false,
        options: cmd_welcome.help.options
    }],
    permissions: {
        bot: [],
        user: [discord.PermissionFlagsBits.ManageGuild]
    },
    inactive: false,
    reason: null,
    nsfw: false,
    cooldown: 3
}

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {string[]} args 
 */
async function main(client, message, args) {
    let option = args[0].toLowerCase()
    if(!option) return 0
    if(help.options[0].name == option || help.options[0].alias.includes(option)) {
        cmd_prefix.main(client, message, args.slice(1))
        return 0
    } 
    if(help.options[1].name == option || help.options[1].alias.includes(option)) {
        cmd_welcome.main(client, message, args.slice(1))
        return 0
    } 
    return 0
}

/**
 * @param {discord.Client} client
 * @param {discord.CommandInteraction} interaction
 */
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