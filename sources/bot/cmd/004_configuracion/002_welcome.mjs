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
        }, {
            name: 'embed',
            alias: ['isembed', 'is_embed'],
            description: 'Establece si la bienvenida se da en un embed',
            required: false,
            options: []
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
    let aliases = null;

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
        if (option.toLowerCase() == target.name || target.alias.includes(option.toLowerCase())) {
            aliases = [
                target.options[0].name,
                ...target.options[0].alias,
                target.options[1].name,
                ...target.options[1].alias,
                target.options[2].name,
                ...target.options[2].alias,
            ]
            if (!sub_option || !aliases.includes(sub_option.toLowerCase())) {
                await reply(message, {
                    color: discord.Colors.Red,
                    description: config.maple_reply('error', 'Necesitas seleccionar una opcion de texto <title | description | message>')
                })
                return 1
            }

            target = target.options

            if (sub_option.toLowerCase() == target[0].name || target[0].alias.includes(sub_option.toLowerCase())) {
                if (!value) {
                    await reply(message, {
                        color: discord.Colors.Red,
                        description: config.maple_reply('error', 'Necesitas escribir el nuevo titulo para la bienvenida')
                    })
                    return 1
                }
                if (value.length < 1 || value.length > 40) {
                    await reply(message, {
                        color: discord.Colors.Red,
                        description: config.maple_reply('error', 'El titulo debe tener de uno a cuarenta letras')
                    })
                    return 1
                }
                if (!server_db) {
                    new_doc = new config.Welcome({
                        guildId: message.guildId,
                        title: value
                    })
                    await new_doc.save()
                } else {
                    if (value == server_db.title) {
                        await reply(message, {
                            color: discord.Colors.Red,
                            description: config.maple_reply('error', 'El titulo debe tener de uno a cuarenta letras')
                        })
                        return 1
                    }
                    server_db.title = value
                    await server_db.save();
                }
                await message.reply({
                    embeds: [{
                        color: discord.Colors.Green,
                        description: config.maple_reply('success', 'El nuevo titulo de bienvenida sera el siguente:'),
                        fields: [{
                            name: 'Titulo [Ejemplo]',
                            value: config.text_wl_vars(value, {
                                user: message.author.globalName || message.author.username,
                                server: message.guild?.name,
                                count: message.guild.memberCount
                            }).trim()
                        }]
                    }]
                })
                return 0
            }
        }

        target = help.options[0].options[2]

        // texto
        if (option.toLowerCase() == target.name || target.alias.includes(option.toLowerCase())) {
            if(!sub_option || !['y', 'n'].includes(sub_option.toLowerCase())) {
                await reply(message, {
                    color: discord.Colors.Red,
                    description: config.maple_reply('error', 'Necesitas seleccionar una opcion <y | n>')
                })
                return 1
            }
            value = sub_option.toLowerCase() == 'y' ? true: false
            if(!server_db) {
                new_doc = new config.Welcome({
                    guildId: message.guildId,
                    isEmbed: value
                })
                await new_doc.save()
            } else {
                if(value == server_db.isEmbed) {
                    await reply(message, {
                        color: discord.Colors.Red,
                        description: config.maple_reply('error', 'El valor a establecer no puede ser igual al ya configurado')
                    })
                    return 1
                }
                server_db.isEmbed = value
                await server_db.save()
            }
            await reply(message, {
                color: discord.Colors.Red,
                description: config.maple_reply('success', value ? 'Se mostrara la bienvenida como embed': 'Se mostrara la bienvenida como imagen')
            })
            return 0
        }

    } catch (error) {
        console.error(error)
        await reply(message, {
            color: 0x000000,
            description: config.maple_reply('critical', 'Ha ocurrido un error en la ejecución del comando')
        })
        return 1
    }
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