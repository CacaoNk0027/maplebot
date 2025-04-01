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

    if (!args.length) {
        await message.reply({
            embeds: [{
                color: discord.Colors.Red,
                description: config.maple_reply('error', 'Debes especificar una opción!'),
                footer: {
                    text: 'si tienes dudas presiona el boton de abajo'
                }
            }],
            components: [{
                type: discord.ComponentType.ActionRow,
                components: [{
                    type: discord.ComponentType.Button,
                    custom_id: 'button.001',
                    label: 'Ayuda',
                    emoji: '📄',
                    style: discord.ButtonStyle.Secondary
                }]
            }]
        })
        return 0
    }

    let [option, sub_option, ...values] = args
    let value = values.join(' ').trim()
    let server_db = null;
    let new_doc = null;
    let target = null;

    try {
        let channelId = option.match(/\d{17,19}/)?.[0]

        if (!!channelId) {
            channelId = await config.validate_channel(message, channelId)
            server_db = await config.Channels.findOne({ guildId: message.guildId })

            if (!channelId) {
                await reply(message, {
                    color: discord.Colors.Red,
                    description: config.maple_reply('error', 'el canal mencionado no es valido')
                })
                return 1
            }

            if (!server_db) {
                new_doc = new config.Channels({
                    guildId: message.guildId,
                    welcomeId: channelId
                })
                await new_doc.save()
            } else {
                if (!server_db.compareId('welcomeId', channelId)) {
                    await reply(message, {
                        color: discord.Colors.Red,
                        description: config.maple_reply('error', 'el canal mencionado es exactamente igual al establecido')
                    })
                    return 1
                }

                server_db.welcomeId = channelId
                await server_db.save()
            }

            await reply(message, {
                color: discord.Colors.Green,
                description: config.maple_reply('success', `Se ha establecido el canal <#${channelId}> como preterminado para bienvenidas`)
            })

            return 0
        }

        target = help.options[0].options[1]
        server_db = await config.Welcome.findOne({ guildId: message.guildId })

        // texto
        if(option == target.name || target.alias.includes(option)) {
            if(!sub_option) {
                await reply(message, {
                    color: discord.Colors.Red,
                    description: config.maple_reply('error', 'Necesitas seleccionar una opcion de texto <title | description | message>')
                })
                return 1
            }

            target = target.options

            if(sub_option == target[0].name || target[0].alias.includes(sub_option)) {
                if(!value) {
                    await reply(message, {
                        color: discord.Colors.Red,
                        description: config.maple_reply('error', 'Necesitas escribir el nuevo titulo para la bienvenida')
                    })
                    return 1
                }
                if(value.length < 1 || value.length > 40) {
                    await reply(message, {
                        color: discord.Colors.Red,
                        description: config.maple_reply('error', 'El titulo debe tener de uno a cuarenta letras')
                    })
                    return 1
                }
                
            }
        }

    } catch (error) {
        console.error(error)
        await reply(message, {
            color: 0x000000,
            description: config.maple_reply('critical', 'Ha ocurrido un error en la ejecución del comando')
        })
        return 1
    }

    // exprs = help.options[0].options[1]
    // server_db = await config.Welcome.findOne({ guildId: message.guildId })

    // // opcion de texto
    // if (option == exprs.name || exprs.alias.includes(option)) {
    //     option = args[1]
    //     if (!option) {
    //         await message.reply({
    //             embeds: [{
    //                 color: discord.Colors.Red,
    //                 description: `Debes de elegir una de las subopciones <title, description, message>`
    //             }]
    //         })
    //         return 1
    //     }
    //     // para titulo
    //     if (option == exprs.options[0].name || exprs.options[0].alias.includes(option)) {
    //         if (!args[2]) {
    //             await message.reply({
    //                 embeds: [{
    //                     color: discord.Colors.Red,
    //                     description: `El titulo no puede estar vacio`
    //                 }]
    //             })
    //             return 1
    //         }

    //         option = args.slice(2).join(' ').trim();

    //         if (!server_db) {
    //             new_doc = new config.Welcome({
    //                 guildId: message.guildId,
    //                 title: option
    //             })

    //             await new_doc.save();

    //             await message.reply({
    //                 embeds: [{
    //                     color: discord.Colors.Green,
    //                     description: `Este sera el nuevo titulo para la bienvenida:`,
    //                     fields: [{
    //                         name: 'Titulo',
    //                         value: option
    //                     }]
    //                 }]
    //             })

    //             return 0
    //         }

    //         if (server_db.title == option) {

    //             await message.reply({
    //                 embeds: [{
    //                     color: discord.Colors.Red,
    //                     description: `El titulo no puede ser exactamente igual al anterior`
    //                 }]
    //             })

    //             return 1
    //         }

    //         server_db.title = option;
    //         await server_db.save();

    //         await message.reply({
    //             embeds: [{
    //                 color: discord.Colors.Green,
    //                 description: `Este sera el nuevo titulo para la bienvenida:`,
    //                 fields: [{
    //                     name: 'Titulo',
    //                     value: option
    //                 }]
    //             }]
    //         })

    //         return 0

    //     }
    // }
    // return 0
}

async function reply(message, { color, description, fields = [] }) {
    await message.reply({
        embeds: [{
            color,
            description,
            fields
        }]
    });
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