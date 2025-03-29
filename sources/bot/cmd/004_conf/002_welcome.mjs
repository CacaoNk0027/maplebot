import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const name = 'welcome'
const id = '002'

let help = {
    alias: ['wlc', 'bienvenida', 'in'],
    description: 'Establece un sistema de bienvenidas en tu servidor',
    category: '004',
    options: [{
        name: 'options',
        alias: [],
        description: 'Opciones requeridas en el comando welcome',
        required: true,
        options: []
    }],
    permissions: {
        bot: [
            discord.PermissionFlagsBits.ManageChannels
        ],
        user: [
            discord.PermissionFlagsBits.ManageChannels
        ]
    },
    inactive: true,
    reason: 'comando en desarrollo',
    nsfw: false,
    cooldown: 3
}

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {string[]} args 
 */
async function main(client, message, args) {
    let option = args[0];

    if(!option) {
        await message.reply({
            embeds: [{
                color: discord.Colors.Red,
                description: 'Necesitas colocar una de las opciones requeridas o mencionar el canal a establecer'
            }]
        })
        return 1
    }
    if(!!option.match(/\d{17,19}/)[0]) {
        if(!!(await config.Channels.findOne({ guildId: message.guildId }))) {
            await message.reply({
                embeds: [{
                    color: discord.Colors.Red,
                    description: 'Este servidor no existe en la base de datos'
                }]
            })
            return 1
        }
        return 0
    }
    return 0
}

/**
 * @param {discord.Client} client
 * @param {discord.CommandInteraction} interaction
 */
async function slash(client, interaction) {
    return 0;
}

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {string[]} args 
 */
async function text(client, message, args) {

}

export {
    name,
    id,
    help,
    main,
    slash
}