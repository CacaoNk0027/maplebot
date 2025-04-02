import * as discord from 'discord.js'
import hex_regex from 'hex-color-regex'
import fetch from 'node-fetch'
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
            alias: ['isembed', 'is_embed', 'e'],
            description: 'Establece si la bienvenida se da en un embed',
            required: false,
            options: []
        }, {
            name: 'background',
            alias: ['b', 'back', 'bk', 'fondo'],
            description: 'Añade un fondo a la imagen de bienvenida',
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

            if (await text({
                message,
                server_db,
                value,
                sub_option,
                target
            }, {
                index: 0,
                msg: 'El titulo',
                rank_maxval: 40
            })) return 0;

            if (await text({
                message,
                server_db,
                value,
                sub_option,
                target
            }, {
                index: 1,
                msg: 'La descripción',
                rank_maxval: 60
            })) return 0;

            if (await text({
                message,
                server_db,
                value,
                sub_option,
                target
            }, {
                index: 2,
                msg: 'El mensaje',
                rank_maxval: 400
            })) return 0;

        }

        target = help.options[0].options[2]

        // embed
        if (option.toLowerCase() == target.name || target.alias.includes(option.toLowerCase())) {
            if (!sub_option || !['y', 'n'].includes(sub_option.toLowerCase())) {
                await reply(message, {
                    color: discord.Colors.Red,
                    description: config.maple_reply('error', 'Necesitas seleccionar una opcion <y | n>')
                })
                return 1
            }
            value = sub_option.toLowerCase() == 'y' ? true : false
            if (!server_db) {
                new_doc = new config.Welcome({
                    guildId: message.guildId,
                    isEmbed: value
                })
                await new_doc.save()
            } else {
                if (value == server_db.isEmbed) {
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
                description: config.maple_reply('success', value ? 'Se mostrara la bienvenida como embed' : 'Se mostrara la bienvenida como imagen')
            })
            return 0
        }

        target = help.options[0].options[3]

        // background
        if (option.toLowerCase() == target.name || target.alias.includes(option.toLowerCase())) {
            if (!sub_option) {
                await reply(message, {
                    color: discord.Colors.Red,
                    description: config.maple_reply('error', 'Debes ingresar un color hexadecimal o una URL')
                })
                return 1
            }
            if (hex_regex().test(sub_option)) {
                if (!server_db) {
                    new_doc = new config.Welcome({
                        guildId: message.guildId,
                        background: {
                            data: sub_option,
                            type: 'color'
                        }
                    })
                    await new_doc.save();
                } else {
                    if (sub_option == server_db.background?.data) {
                        await reply(message, {
                            color: discord.Colors.Red,
                            description: config.maple_reply('error', 'El color a establecer es exactamente igual al ya establecido')
                        })
                        return 1
                    }
                    server_db.background.data = sub_option
                    server_db.background.type = 'color'
                    await server_db.save();
                }
                await reply(message, {
                    color: parseInt(sub_option.replace('#', ''), 16),
                    description: config.maple_reply('success', 'Se ha establecido el color correctamente')
                })
                return 0
            }

            try {
                let url = new URL(sub_option);
                let response = null;

                if (!['http:', 'https:'].includes(url.protocol)) {
                    await reply(message, {
                        color: discord.Colors.Red,
                        description: config.maple_reply('error', 'La URL de la imagen es inválida, necesita usar HTTP/HTTPS'),
                        fields: [{
                            name: 'Formato de URL',
                            value: config.code_text('<http|https>://(www.)imagen.com/url_a_la_imagen.<jpg|jpeg|png|gif>')
                        }]
                    });
                    return 1;
                }

                let extension = url.pathname.toLowerCase().split('.').pop();
                if (!['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
                    await reply(message, {
                        color: discord.Colors.Red,
                        description: config.maple_reply('error', 'La URL de la imagen es inválida, necesita tener extensión <jpg | jpeg | png | gif | webp>'),
                        fields: [{
                            name: 'Formato de URL',
                            value: config.code_text('<http|https>://(www.)imagen.com/url_a_la_imagen.<jpg|jpeg|png|gif|webp>')
                        }]
                    });
                    return 1;
                }

                let controller = new AbortController();
                let timeout = setTimeout(() => controller.abort(), 5000);

                try {

                    response = await fetch(url, {
                        method: 'HEAD',
                        signal: controller.signal,
                        redirect: 'follow'
                    });

                    clearTimeout(timeout);

                    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
                        await reply(message, {
                            color: discord.Colors.Red,
                            description: config.maple_reply('error', 'La URL no apunta a una imagen válida o el servidor no está disponible')
                        });
                        return 1;
                    }

                } catch (fetchError) {
                    clearTimeout(timeout);
                    await reply(message, {
                        color: discord.Colors.Red,
                        description: config.maple_reply('critical', fetchError.name === 'AbortError'
                            ? 'La verificación de la URL tardó demasiado'
                            : 'No se pudo verificar la URL de la imagen')
                    });
                    return 1;
                }

            } catch (urlError) {
                await reply(message, {
                    color: discord.Colors.Red,
                    description: config.maple_reply('error', 'No se ha detectado una URL válida o un color hexadecimal')
                });
                return 1;
            }

            if (!server_db) {
                new_doc = new config.Welcome({
                    guildId: message.guildId,
                    background: {
                        data: sub_option,
                        type: 'image'
                    }
                })
                await new_doc.save();
            } else {
                if (sub_option == server_db.background?.data) {
                    await reply(message, {
                        color: discord.Colors.Red,
                        description: config.maple_reply('error', 'La URL a establecer es exactamente igual al ya establecida')
                    })
                    return 1
                }
                server_db.background.data = sub_option
                server_db.background.type = 'image'
                await server_db.save();
            }

            await reply(message, {
                color: discord.Colors.Green,
                description: config.maple_reply('success', 'Se ha establecido la imagen correctamente'),
                image: {
                    url: sub_option
                }
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

/**
 * @param {discord.Client} client
 * @param {discord.CommandInteraction} interaction
 */
async function slash(client, interaction) {
    return 0
}

let entries = {
    index: NaN,
    rank_maxval: NaN,
    msg: null
}
let confsg = {
    message: null,
    server_db: null,
    value: null,
    sub_option: null,
    target: null
}

async function text(confs = confsg, obj = entries) {
    let { message, server_db, value, sub_option, target } = confs
    let { index, msg, rank_maxval } = obj
    let new_doc = null;
    if (sub_option.toLowerCase() == target[index].name || target[index].alias.includes(sub_option.toLowerCase())) {
        if (!value) {
            await reply(message, {
                color: discord.Colors.Red,
                description: config.maple_reply('error', 'Necesitas escribir ' + msg.toLowerCase() + ' para la bienvenida')
            })
            return 1
        }
        if (value.length < 1 || value.length > rank_maxval) {
            await reply(message, {
                color: discord.Colors.Red,
                description: config.maple_reply('error', msg + ' debe tener de 1 a ' + rank_maxval + ' letras')
            })
            return 1
        }
        if (!server_db) {
            new_doc = new config.Welcome({
                guildId: message.guildId,
            })
            new_doc[target[index].name] = value
            await new_doc.save()
        } else {
            if (value == server_db.title) {
                await reply(message, {
                    color: discord.Colors.Red,
                    description: config.maple_reply('error', msg + ' no debe ser igual al valor que se establecio anteriormente')
                })
                return 1
            }
            server_db[target[index].name] = value
            await server_db.save();
        }
        await message.reply({
            embeds: [{
                color: discord.Colors.Green,
                description: config.maple_reply('success', msg + ' de bienvenida sera el siguente:'),
                fields: [{
                    name: msg.slice(3) + ' [Ejemplo]',
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
    return 0
}

async function reply(message, { color, description, fields = [], ...args }) {
    await message.reply({
        embeds: [{
            color,
            description,
            fields,
            ...args
        }]
    });
}
export {
    name,
    id,
    help,
    main,
    slash
}