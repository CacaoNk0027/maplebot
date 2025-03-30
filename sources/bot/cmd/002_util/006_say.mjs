import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const name = 'say'
const id = '006'

let help = {
    alias: ['decir'],
    description: 'Envia un mensaje a mi nombre',
    category: '002',
    options: [{
        name: 'message',
        alias: [],
        description: 'Escribe el mensaje',
        required: true,
        options: []
    }],
    permissions: {
        bot: [],
        user: []
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
    let text, reply

    if (!args[0]) {
        await message.reply({
            embeds: [{
                description: '> La opcion `<mensaje>` es requerida',
                color: discord.Colors.Red
            }]
        })
        return 0
    }

    text = args.join(' ')

    try {
        (await message.delete())

        if (message.reference?.messageId) {
            (await (await message.channel.messages.fetch(message.reference?.messageId)).reply(text))
            return 0
        }

        message.channel.send(text)
    } catch (error) {
        console.error(error)
        await message.reply({
            embeds: [{
                description: '> Ocurrio un error interno, comunicate con el desarrollador',
                color: discord.Colors.Red
            }]
        })
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