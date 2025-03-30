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
        description: 'selecciona una de las opciones para el sistema de bienvenidas',
        required: true,
        options: [{
            name: 'channel',
            alias: [],
            description: 'Menciona el canal donde se establecera el sistema de bienvenidas',
            required: true,
            options: []
        }, {
            name: 'text',
            alias: ['tx', 't', 'texto'],
            description: 'Modifica los textos de la bienvenida',
            required: true,
            options: [{
                name: 'title',
                alias: ['t', 'tit', 'titulo'],
                description: 'Modifica el título de la bienvenida | por defecto si se deja vacio',
                required: false,
                options: []
            }, {
                name: 'description',
                alias: ['desc', 'd', 'descripcion'],
                description: 'Modifica la descripción de la bienvenida | por defecto si se deja vacio',
                required: false,
                options: []
            }, {
                name: 'message',
                alias: ['m', 'msg', 'mensaje'],
                description: 'Modifica el mensaje de la bienvenida | por defecto si se deja vacio',
                required: false,
                options: []
            }]
        }]
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
    let channelId = null, new_doc = null, option = args[0], exprs
    let server_db = await config.Channels.findOne({ guildId: message.guildId })

    if (!option) {
        await message.reply({
            embeds: [{
                color: discord.Colors.Red,
                description: 'Necesitas colocar una de las opciones requeridas o mencionar el canal a establecer'
            }]
        })
        return 1
    }

    channelId = option.match(/\d{17,19}/)

    if (!!channelId) {

        channelId = await config.validate_channel(message, channelId[0])

        if (!channelId) return 1

        try {
            if (!server_db) {
                new_doc = new config.Channels({
                    guildId: message.guildId,
                    welcomeId: channelId
                })
                await new_doc.save()
            } else {

                if (server_db.compareId('welcomeId', channelId)) {
                    await message.reply({
                        embeds: [{
                            color: discord.Colors.Red,
                            description: `El canal mencionado ya es actualmente el canal de bienvenidas`
                        }]
                    })
                    return 1
                }

                server_db.welcomeId = channelId
                await server_db.save()
            }

            await message.reply({
                embeds: [{
                    color: discord.Colors.Green,
                    description: `Se ha establecido el canal <#${channelId}> como preterminado para bienvenidas`
                }]
            })

            return 0
        } catch (error) {
            await message.reply({
                embeds: [{
                    color: discord.Colors.Red,
                    description: `Fallo al establecer <#${channelId}> como canal para bienvenidas`
                }]
            })

            return 1
        }
    }

    exprs = help.options[0].options[1]

    // opcion de texto
    if (option == exprs.name || exprs.alias.includes(option)) {
        option = args[1]
        if (!option) {
            return 0
        }
        // para titulo
        if (option == exprs.options[0].name || exprs.options[0].alias.includes(option)) {
            if (!args[2]) {
                return 1
            }

            option = args.slice(2).join(' ')


        }
    }

    if (option == 'test') {

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