import * as config from '../../config/config.mjs'
import neekuro from 'neekuro'
import * as discord from 'discord.js'

const name = 'pat'
const id = '001'

let help = {
    alias: ['caricia', 'acariciar'],
    description: 'Acaricia a un usuario',
    category: '005',
    options: [{
        name: 'user',
        alias: [],
        description: 'acaricia a un usuario',
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
    let user = null, validator = null
    let gif = await neekuro.SFW.getGif('action', 'pat')
    let answers = [], identifier = args[0]

    validator = new config.User(client, message, identifier)
    if (!(await validator.valid())) {
        validator.setUser(message.author)
    }

    user = validator.getUser()
    if (user.id == message.author.id) {
        await message.reply({
            embeds: [{
                color: config.random_color(),
                description: `<:006:1012749025398759425> **${message.author.globalName || message.author.username}** acaricia a alguna cosa`,
                footer: {
                    text: `Anime: ${gif.getAnime()}`
                },
                image: {
                    url: gif.getUrl()
                }
            }]
        })
        return 0
    }
    if (user.id == client.user.id) {
        await message.reply({
            embeds: [{
                color: config.random_color(),
                description: `<:008:1012749028762603550> Recibe mis caricias **${message.author.globalName || message.author.username}**!`,
                footer: {
                    text: `Anime: ${gif.getAnime()}`
                },
                image: {
                    url: gif.getUrl()
                }
            }]
        })
        return 0
    }

    answers = [
        `<:007:1012749027508498512> **${message.author.globalName || message.author.username}** acaricia gentilmente a **${user.globalName || user.username}**`,
        `<:007:1012749027508498512> **${user.globalName || user.username}** recibe caricias de **${message.author.globalName || message.author.username}**`,
        `<:007:1012749027508498512> **${message.author.globalName || message.author.username}** mima a **${user.globalName || user.username}** con suaves caricias`,
        `<:007:1012749027508498512> **${user.globalName || user.username}** se derrite con las caricias de **${message.author.globalName || message.author.username}**`,
        `<:007:1012749027508498512> **${message.author.globalName || message.author.username}** traza suaves círculos en la espalda de **${user.globalName || user.username}**`,
        `<:007:1012749027508498512> **${message.author.globalName || message.author.username}** y **${user.globalName || user.username}** comparten caricias`,
    ]

    await message.reply({
        embeds: [{
            color: config.random_color(),
            description: answers[Math.floor(Math.random() * answers.length)],
            footer: {
                text: `Anime: ${gif.getAnime()}`
            },
            image: {
                url: gif.getUrl()
            }
        }]
    })

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