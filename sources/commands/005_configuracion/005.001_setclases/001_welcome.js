const discord = require('discord.js');
;
const regex_c = require('hex-color-regex')({ strict: true });
const config = require('../../../utils/exports')
const nekoapi = require('nekoapi.beta')
const {
    replaces_msg_i,
    randomColor,
    newColorImage,
    interactionErrorMsg,
    defaultAvatar,
    parseJson
} = require('../../../utils/exports');

/**
 * @param {discord.Client} client
 * @param {discord.CommandInteraction} interaction
 */
exports.Welcome = async (client, interaction) => {
    try {
        let option;
        switch (interaction.options._subcommand) {
            case "channel":
                option = interaction.options._hoistedOptions[0]
                let channel = await client.channels.fetch(option.value);
                if (channel.type != discord.ChannelType.GuildText) return await interaction.reply({
                    embeds: [{
                        description: config.statusError('error', "no puedes poner un canal que no sea de texto"),
                        color: 0xff0000
                    }]
                });
                if (!channel.permissionsFor(client.user.id).has(discord.PermissionFlagsBits.SendMessages)) return await interaction.reply({
                    embeds: [{
                        description: config.statusError('error', "no puedes establecer un canal que no puedo ver o en el que no puedo hablar"),
                        color: 0xff0000
                    }]
                });
                if (await config.schemas.Welcome.findOne({ guildID: interaction.guildId }) == null) {
                    let WlcDb = new config.schemas.Welcome({
                        guildID: interaction.guildId,
                        message: null,
                        type: null,
                        background: {
                            tipo: null,
                            data: null
                        },
                        color: {
                            title: null,
                            description: null,
                            avatar: null
                        },
                        description: null,
                        title: null
                    })
                    await WlcDb.save();
                }
                let channelWlc = await config.schemas.SetChannels.findOne({ guildID: interaction.guildId });
                if (channelWlc == null) {
                    let ChannelDb = new config.schemas.SetChannels({
                        guildID: interaction.guildId,
                        suggest: null,
                        confession: null,
                        welcome: channel.id,
                        farewell: null
                    });
                    await ChannelDb.save();
                    await interaction.reply({
                        embeds: [{
                            description: config.statusError('success', `Se ha establecido <#${channel.id}> como preterminado para bienvenidas`),
                            color: 0x00ff00
                        }]
                    })
                } else if (channelWlc.welcome == null) {
                    await config.schemas.SetChannels.updateOne({ guildID: interaction.guildId }, { welcome: channel.id })
                    await interaction.reply({
                        embeds: [{
                            description: config.statusError('success', `Se ha establecido <#${channel.id}> como preterminado para bienvenidas`),
                            color: 0x00ff00
                        }]
                    })
                } else if (channelWlc == channel.id) {
                    await interaction.reply({
                        embeds: [{
                            description: config.statusError('error', `El canal que haz seleccionado es exactamente igual al canal que haz establecido anteriormente`),
                            color: 0xff0000
                        }]
                    })
                } else {
                    await config.schemas.SetChannels.updateOne({ guildID: interaction.guildId }, { welcome: channel.id })
                    await interaction.reply({
                        embeds: [{
                            description: config.statusError('success', `Se ha establecido <#${channel.id}> como preterminado para bienvenidas`),
                            color: 0x00ff00
                        }]
                    })
                }
                break;
            case "message":
                const _replytomessage = async () => {
                    await interaction.reply({
                        embeds: [{
                            title: "necesitas ayuda?",
                            color: randomColor(),
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.avatarURL({ forceStatic: false })
                            },
                            description: "Estas en el menu de ayuda para este comando! asi que debes saber que para el comando /set welcome message hay dos opciones de las cuales debes responder solo una",
                            fields: [{
                                name: "text",
                                value: "En esta opcion debes escribir un texto que quieres que se muestre arriba de la imagen, puedes añadir ciertos parametros en el texto agregando ciertas cosas al texto para darle vida, solo puedes poner 300 palabras aqui por lo que no puede escribir mucho mas, **para mas informacion sobre los parametros presiona el boton text**"
                            }, {
                                name: "delete",
                                value: "Si haz establecido un mensaje y no te gusto puedes eliminarlo con esta opcion, esta misma solo acepta dos valores dados en la lista emergente que sale... `True` | `False` si estas seguro de eliminar el mensaje selecciona true, de lo contrario selecciona false o ignora el comando"
                            }]
                        }],
                        components: [{
                            type: discord.ComponentType.ActionRow,
                            components: [{
                                type: discord.ComponentType.Button,
                                customId: "set.welcome.params",
                                style: discord.ButtonStyle.Secondary,
                                label: "text",
                                emoji: "📑"
                            }]
                        }]
                    })
                    setTimeout(async () => {
                        await interaction.editReply({
                            components: [{
                                type: discord.ComponentType.ActionRow,
                                components: [{
                                    type: discord.ComponentType.Button,
                                    customId: "set.welcome.params",
                                    style: discord.ButtonStyle.Secondary,
                                    label: "interaccion terminada",
                                    emoji: "❌",
                                    disabled: true
                                }]
                            }]
                        })
                    }, (60 * 1) * 1000);
                }
                if (interaction.options._hoistedOptions.length <= 0) return await _replytomessage();
                option = interaction.options._hoistedOptions[0]
                switch (option.name) {
                    case "text":
                        let text = await option.value
                        if (!text.trim().split(/ +/g).length > 300) return await interaction.reply({
                            embeds: [{
                                description: config.statusError('error', "no puedes poner mas de 300 palabras en el mensaje de bienvenida"),
                                color: 0xff0000
                            }]
                        })
                        let msgWlc_1 = await config.schemas.Welcome.findOne({ guildID: interaction.guildId })
                        if (msgWlc_1 == null) {
                            let WlcDb = new config.schemas.Welcome({
                                guildID: interaction.guildId,
                                message: text,
                                type: null,
                                background: {
                                    tipo: null,
                                    data: null
                                },
                                color: {
                                    title: null,
                                    description: null,
                                    avatar: null
                                },
                                description: null,
                                title: null
                            })
                            await WlcDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `El mensaje de bienvenida sera mostrado como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        } else if (msgWlc_1.message == null) {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { message: text })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `El mensaje de bienvenida sera mostrado como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        } else if (text == msgWlc_1.message) {
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('error', "no puedes escribir un mensaje similar o igual al anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { message: text })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `El mensaje de bienvenida sera mostrado como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        }
                        break;
                    case "delete":
                        switch (option.value) {
                            case true:
                                let msgWlc_2 = await config.schemas.Welcome.findOne({ guildID: interaction.guildId });
                                if (msgWlc_2 == null) return await interaction.reply({
                                    embeds: [{
                                        description: config.statusError("error", "no cuentas con un sistema de bienvenidas"),
                                        color: 0xff0000
                                    }]
                                });
                                if (msgWlc_2.message == null) return await interaction.reply({
                                    embeds: [{
                                        description: config.statusError('error', "no tienes un mensaje establecido"),
                                        color: 0xff0000
                                    }]
                                });
                                await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { message: null })
                                await interaction.reply({
                                    embeds: [{
                                        description: config.statusError('success', "el mensaje de bienvenida ha sido eliminado"),
                                        color: 0x00ff00
                                    }]
                                })
                                break;
                            case false:
                                await interaction.reply({
                                    embeds: [{
                                        description: config.statusError('error', "no se eliminara el mensaje de bienvenida"),
                                        color: 0x00ff00
                                    }]
                                });
                                break;
                        }
                        break;
                    default:
                        await _replytomessage();
                }
                break;
            case "type":
                option = interaction.options._hoistedOptions[0];
                let type = option.value
                let typeWlc = await config.schemas.Welcome.findOne({ guildID: interaction.guildId })
                if (typeWlc == null) {
                    let WlcDb = new config.schemas.Welcome({
                        guildID: interaction.guildId,
                        message: null,
                        type: type,
                        background: {
                            tipo: null,
                            data: null
                        },
                        color: {
                            title: null,
                            description: null,
                            avatar: null
                        },
                        description: null,
                        title: null
                    })
                    await WlcDb.save();
                    await interaction.reply({
                        embeds: [{
                            description: config.statusError('success', `Haz seleccionado el tipo de bienvenidas como **${type == "image" ? "Imagen" : "Embed"}**`),
                            color: 0x00ff00
                        }]
                    })
                } else if (typeWlc.type == null) {
                    await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { type: type })
                    await interaction.reply({
                        embeds: [{
                            description: config.statusError('success', `Haz seleccionado el tipo de bienvenidas como **${type == "image" ? "Imagen" : "Embed"}**`),
                            color: 0x00ff00
                        }]
                    })
                } else if (type == typeWlc.type) {
                    await interaction.reply({
                        embeds: [{
                            description: config.statusError('error', `Ya haz seleccionado ese tipo de bienvenida antes`),
                            color: 0xff0000
                        }]
                    })
                } else {
                    await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { type: type })
                    await interaction.reply({
                        embeds: [{
                            description: config.statusError('success', `Haz seleccionado el tipo de bienvenidas como **${type == "image" ? "Imagen" : "Embed"}**`),
                            color: 0x00ff00
                        }]
                    })
                }
                break;
            case "description":
                const _replytodescription = async () => {
                    await interaction.reply({
                        embeds: [{
                            title: "necesitas ayuda?",
                            color: randomColor(),
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.avatarURL({ forceStatic: false })
                            },
                            description: "Estas en el menu de ayuda para este comando! asi que debes saber que para el comando /set welcome description hay tres opciones de las cuales debes responder solo una",
                            fields: [{
                                name: "text",
                                value: "En esta opcion debes escribir un texto que quieres que se muestre como descripcion de la imagen, puedes añadir ciertos parametros en el texto agregando ciertas cosas al texto para darle vida, solo puedes poner 10 palabras aqui por lo que no se puede escribir mucho mas, **para mas informacion sobre los parametros presiona el boton text**"
                            }, {
                                name: "color",
                                value: "Aqui puedes establecer un color para las letras de la descripcion, solo basta con seleccionar este parametro y escribir el color que quieras en hexadecimal, puedes guiarte de [HTML color codes](https://htmlcolorcodes.com/), un ejemplo de un color es #ff0000 (rojo)"
                            }, {
                                name: "delete",
                                value: "Si haz establecido una descricion y no te gusto puedes eliminarla con esta opcion, esta misma solo acepta dos valores dados en la lista emergente que sale... `True` | `False` si estas seguro de eliminar la descripcion selecciona true, de lo contrario selecciona false o ignora el comando"
                            }]
                        }],
                        components: [{
                            type: discord.ComponentType.ActionRow,
                            components: [{
                                type: discord.ComponentType.Button,
                                customId: "set.welcome.params",
                                style: discord.ButtonStyle.Secondary,
                                label: "text",
                                emoji: "📑"
                            }]
                        }]
                    })
                    setTimeout(async () => {
                        await interaction.editReply({
                            components: [{
                                type: discord.ComponentType.ActionRow,
                                components: [{
                                    type: discord.ComponentType.Button,
                                    customId: "set.welcome.params",
                                    style: discord.ButtonStyle.Secondary,
                                    label: "interaccion terminada",
                                    emoji: "❌",
                                    disabled: true
                                }]
                            }]
                        })
                    }, (60 * 1) * 1000);
                }
                if (interaction.options._hoistedOptions.length <= 0) return await _replytodescription();
                option = interaction.options._hoistedOptions[0]
                switch (option.name) {
                    case "text":
                        let text = option.value
                        if (!text.trim().split(/ +/g).length > 10) return await interaction.reply({
                            embeds: [{
                                description: config.statusError('error', "no puedes poner mas de 10 palabras en la descripcion de bienvenida"),
                                color: 0xff0000
                            }]
                        })
                        let descWlc_1 = await config.schemas.Welcome.findOne({ guildID: interaction.guildId })
                        if (descWlc_1 == null) {
                            let WlcDb = new config.schemas.Welcome({
                                guildID: interaction.guildId,
                                message: null,
                                type: null,
                                background: {
                                    tipo: null,
                                    data: null
                                },
                                color: {
                                    title: null,
                                    description: null,
                                    avatar: null
                                },
                                description: text,
                                title: null
                            })
                            await WlcDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `La descripcion de la bienvenida sera mostrada como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        } else if (descWlc_1.description == null) {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { description: text })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `La descripcion de la bienvenida sera mostrada como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        } else if (text == descWlc_1.description) {
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('error', "no puedes escribir una descripcion similar o igual al anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { description: text })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `La descripcion de la bienvenida sera mostrada como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        }
                        break;
                    case "color":
                        let hex_color = option.value.toLowerCase();
                        if (!regex_c.test(hex_color)) return await interaction.reply({
                            embeds: [{
                                description: config.statusError('error', `El ${hex_color} es invalido o no es un color`),
                                color: 0xff0000
                            }]
                        });
                        let image = await newColorImage(hex_color);
                        let descWlc_2 = await config.schemas.Welcome.findOne({ guildID: interaction.guildId })
                        if (descWlc_2 == null) {
                            let WlcDb = new config.schemas.Welcome({
                                guildID: interaction.guildId,
                                message: null,
                                type: null,
                                background: {
                                    tipo: null,
                                    data: null
                                },
                                color: {
                                    title: null,
                                    description: hex_color,
                                    avatar: null
                                },
                                description: null,
                                title: null
                            })
                            await WlcDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `el color de la descripcion se ha establecido correctamente a ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [
                                    image.attachment
                                ]
                            })
                        } else if (descWlc_2.color.description == null) {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { color: { title: descWlc_2.color.title, description: hex_color, avatar: descWlc_2.color.avatar } })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `el color de la descripcion se ha establecido correctamente a ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [
                                    image.attachment
                                ]
                            })
                        } else if (hex_color == descWlc_2.color.description) {
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('error', "el color que haz seleccionado es igual al anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { color: { title: descWlc_2.color.title, description: hex_color, avatar: descWlc_2.color.avatar } })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `el color de la descripcion se ha establecido correctamente a ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [
                                    image.attachment
                                ]
                            })
                        }
                        break;
                    case "delete":
                        switch (option.value) {
                            case true:
                                let descWlc_3 = await config.schemas.Welcome.findOne({ guildID: interaction.guildId });
                                if (descWlc_3 == null) return await interaction.reply({
                                    embeds: [{
                                        description: config.statusError("error", "no cuentas con un sistema de bienvenidas"),
                                        color: 0xff0000
                                    }]
                                });
                                if (descWlc_3.description == null) return await interaction.reply({
                                    embeds: [{
                                        description: config.statusError('error', "no tienes una descripcion establecida"),
                                        color: 0xff0000
                                    }]
                                });
                                await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { description: null })
                                await interaction.reply({
                                    embeds: [{
                                        description: config.statusError('success', "La descripcion de la bienvenida ha sido eliminada"),
                                        color: 0x00ff00
                                    }]
                                })
                                break;
                            case false:
                                await interaction.reply({
                                    embeds: [{
                                        description: config.statusError('error', "no se eliminara la descripcion de la bienvenida"),
                                        color: 0x00ff00
                                    }]
                                });
                                break;
                        }
                        break;
                    default:
                        await _replytodescription();
                }
                break;
            case "title":
                const _replytotitle = async () => {
                    await interaction.reply({
                        embeds: [{
                            title: "necesitas ayuda?",
                            color: randomColor(),
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.avatarURL({ forceStatic: false })
                            },
                            description: "Estas en el menu de ayuda para este comando! asi que debes saber que para el comando /set welcome title hay tres opciones de las cuales debes responder solo una",
                            fields: [{
                                name: "text",
                                value: "En esta opcion debes escribir un texto que quieres que se muestre como titulo de la imagen, puedes añadir ciertos parametros en el texto agregando ciertas cosas al texto para darle vida, solo puedes poner 3 palabras aqui por lo que no se puede escribir mucho mas, **para mas informacion sobre los parametros presiona el boton text**"
                            }, {
                                name: "color",
                                value: "Aqui puedes establecer un color para las letras del titulo, solo basta con seleccionar este parametro y escribir el color que quieras en hexadecimal, puedes guiarte de [HTML color codes](https://htmlcolorcodes.com/), un ejemplo de un color es #ff0000 (rojo)"
                            }, {
                                name: "delete",
                                value: "Si haz establecido un titulo y no te gusto puedes eliminarla con esta opcion, esta misma solo acepta dos valores dados en la lista emergente que sale... `True` | `False` si estas seguro de eliminar el titulo selecciona true, de lo contrario selecciona false o ignora el comando"
                            }]
                        }],
                        components: [{
                            type: discord.ComponentType.ActionRow,
                            components: [{
                                type: discord.ComponentType.Button,
                                customId: "set.welcome.params",
                                style: discord.ButtonStyle.Secondary,
                                label: "text",
                                emoji: "📑"
                            }]
                        }]
                    })
                    setTimeout(async () => {
                        await interaction.editReply({
                            components: [{
                                type: discord.ComponentType.ActionRow,
                                components: [{
                                    type: discord.ComponentType.Button,
                                    customId: "set.welcome.params",
                                    style: discord.ButtonStyle.Secondary,
                                    label: "interaccion terminada",
                                    emoji: "❌",
                                    disabled: true
                                }]
                            }]
                        })
                    }, (60 * 1) * 1000);
                }
                if (interaction.options._hoistedOptions.length <= 0) return await _replytotitle();
                option = interaction.options._hoistedOptions[0]
                switch (option.name) {
                    case "text":
                        let text = option.value
                        if (!text.trim().split(/ +/g).length > 3) return await interaction.reply({
                            embeds: [{
                                description: config.statusError('error', "no puedes poner mas de 3 palabras en la descripcion de bienvenida"),
                                color: 0xff0000
                            }]
                        })
                        let titWlc_1 = await config.schemas.Welcome.findOne({ guildID: interaction.guildId })
                        if (titWlc_1 == null) {
                            let WlcDb = new config.schemas.Welcome({
                                guildID: interaction.guildId,
                                message: null,
                                type: null,
                                background: {
                                    tipo: null,
                                    data: null
                                },
                                color: {
                                    title: null,
                                    description: null,
                                    avatar: null
                                },
                                description: null,
                                title: text
                            })
                            await WlcDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `El titulo de la bienvenida sera mostrado como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        } else if (titWlc_1.title == null) {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { title: text })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `El titulo de la bienvenida sera mostrado como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        } else if (text == titWlc_1.title) {
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('error', "no puedes escribir un titulo similar o igual al anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { title: text })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `El titulo de la bienvenida sera mostrado como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        }
                        break;
                    case "color":
                        let hex_color = option.value.toLowerCase();
                        if (!regex_c.test(hex_color)) return await interaction.reply({
                            embeds: [{
                                description: config.statusError('error', `El ${hex_color} es invalido o no es un color`),
                                color: 0xff0000
                            }]
                        });
                        let image = await newColorImage(hex_color);
                        let titWlc_2 = await config.schemas.Welcome.findOne({ guildID: interaction.guildId })
                        if (titWlc_2 == null) {
                            let WlcDb = new config.schemas.Welcome({
                                guildID: interaction.guildId,
                                message: null,
                                type: null,
                                background: {
                                    tipo: null,
                                    data: null
                                },
                                color: {
                                    title: hex_color,
                                    description: null,
                                    avatar: null
                                },
                                description: null,
                                title: null
                            })
                            await WlcDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `el color del titulo se ha establecido correctamente a ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [
                                    image.attachment
                                ]
                            })
                        } else if (titWlc_2.color.title == null) {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { color: { title: hex_color, description: titWlc_2.color.description, avatar: titWlc_2.color.avatar } })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `el color del titulo se ha establecido correctamente a ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [
                                    image.attachment
                                ]
                            })
                        } else if (hex_color == titWlc_2.color.title) {
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('error', "el color que haz seleccionado es igual al anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { color: { title: hex_color, description: titWlc_2.color.description, avatar: titWlc_2.color.avatar } })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `el color del titulo se ha establecido correctamente a ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [
                                    image.attachment
                                ]
                            })
                        }
                        break;
                    case "delete":
                        switch (option.value) {
                            case true:
                                let titWlc_3 = await config.schemas.Welcome.findOne({ guildID: interaction.guildId });
                                if (titWlc_3 == null) return await interaction.reply({
                                    embeds: [{
                                        description: config.statusError("error", "no cuentas con un sistema de bienvenidas"),
                                        color: 0xff0000
                                    }]
                                });
                                if (titWlc_3.title == null) return await interaction.reply({
                                    embeds: [{
                                        description: config.statusError('error', "no tienes un titulo establecido"),
                                        color: 0xff0000
                                    }]
                                });
                                await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { title: null })
                                await interaction.reply({
                                    embeds: [{
                                        description: config.statusError('success', "el titulo de la bienvenida ha sido eliminada"),
                                        color: 0x00ff00
                                    }]
                                })
                                break;
                            case false:
                                await interaction.reply({
                                    embeds: [{
                                        description: config.statusError('error', "no se eliminara el titulo de la bienvenida"),
                                        color: 0x00ff00
                                    }]
                                });
                                break;
                        }
                        break;
                    default:
                        await _replytotitle();
                }
                break;
            case "background":
                const _replytobackground = async () => {
                    await interaction.reply({
                        embeds: [{
                            title: "necesitas ayuda?",
                            color: randomColor(),
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.avatarURL({ forceStatic: false })
                            },
                            description: "Estas en el menu de ayuda para este comando! asi que debes saber que para el comando /set welcome background hay cuatro opciones de las cuales debes responder solo una",
                            fields: [{
                                name: "image",
                                value: "Lo que hace esta opcion es pedirte una imagen (puede ser cualquier archivo de imagen estatico), es recomentable tratar de calcular por tanteo el tamaño de la imagen para evitar deformidades en la misma, asi mismo, evita poner archivos no compartibles para no provocar errores"
                            }, {
                                name: "link",
                                value: "Puede que no tengas una imagen estatica pero si un link para una imagen, entonces elige esta opcion, al igual que con el parametro image, pega un link de una imagen estatica o de un archivo de imagen compartible, todo esto para evitar fallos en el sistema de bienvenidas"
                            }, {
                                name: "color",
                                value: "Si quieres un color de fondo puedes escribir un color hexadecimal aqui en este parametro, puedes guiarte de [HTML color codes](https://htmlcolorcodes.com/) para elegir el color de tu gusto, un ejemplo para un color seria #ffffaa (un amarillo suavizado)"
                            }, {
                                name: "delete",
                                value: "Si haz establecido fondo y no te gusto puedes eliminarlo con esta opcion, esta misma solo acepta dos valores dados en la lista emergente que sale... `True` | `False` si estas seguro de eliminar el fondo selecciona true, de lo contrario selecciona false o ignora el comando"
                            }]
                        }]
                    })
                }
                if (interaction.options._hoistedOptions.length <= 0) return await _replytobackground();
                option = interaction.options._hoistedOptions[0]
                let imgWlc;
                switch (option.name) {
                    case "image":
                        if (!['jpg', 'jpeg', 'png', 'webp'].includes(option.attachment.name.split('.').pop())) return await interaction.reply({
                            embeds: [{
                                description: config.statusError("error", "no puedo poner ese archivo ya que no tiene un formado compartible `jpg, jpeg, png, webp`, si la imagen tiene un archivo compartible trata de que sea reconocible"),
                                color: 0xff0000
                            }]
                        });
                        imgWlc = await config.schemas.Welcome.findOne({ guildID: interaction.guildId })
                        if (imgWlc == null) {
                            let WlcDb = new config.schemas.Welcome({
                                guildID: interaction.guildId,
                                message: null,
                                type: null,
                                background: {
                                    tipo: "image",
                                    data: option.attachment.url
                                },
                                color: {
                                    title: null,
                                    description: null,
                                    avatar: null
                                },
                                description: null,
                                title: null
                            })
                            await WlcDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError("success", "El fondo de la imagen de bienvenida se ha establecido correctamente"),
                                    color: 0x00ff00,
                                    image: {
                                        url: option.attachment.url
                                    }
                                }]
                            })
                        } else if (imgWlc.background.data == null) {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { background: { tipo: "image", data: option.attachment.url } })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError("success", `El fondo de la imagen de bienvenida se ha establecido correctamente`),
                                    color: 0x00ff00,
                                    image: {
                                        url: option.attachment.url
                                    }
                                }]
                            })
                            // esta mierda de condicion se puede dar? no creo xdxd
                        } else if (imgWlc.background.data == option.attachment.url) {
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError("error", "no puedes poner una imagen igual a la anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { background: { tipo: "image", data: option.attachment.url } })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError("success", "El fondo de la imagen de bienvenida se ha establecido correctamente"),
                                    color: 0x00ff00,
                                    image: {
                                        url: option.attachment.url
                                    }
                                }]
                            })
                        }
                        break;
                    case "link":
                        if (!['jpg', 'jpeg', 'png', 'webp'].includes(option.value.split('.').pop())) return await interaction.reply({
                            embeds: [{
                                description: config.statusError("error", "no puedo poner ese archivo ya que no tiene un formado compartible `jpg, jpeg, png, webp`, si la imagen tiene un archivo compartible trata de que sea reconocible"),
                                color: 0xff0000
                            }]
                        });
                        imgWlc = await config.schemas.Welcome.findOne({ guildID: interaction.guildId })
                        if (imgWlc == null) {
                            let WlcDb = new config.schemas.Welcome({
                                guildID: interaction.guildId,
                                message: null,
                                type: null,
                                background: {
                                    tipo: "image",
                                    data: option.value
                                },
                                color: {
                                    title: null,
                                    description: null,
                                    avatar: null
                                },
                                description: null,
                                title: null
                            })
                            await WlcDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError("success", "El fondo de la imagen de bienvenida se ha establecido correctamente"),
                                    color: 0x00ff00,
                                    image: {
                                        url: option.value
                                    }
                                }]
                            })
                        } else if (imgWlc.background.data == null) {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { background: { tipo: "image", data: option.value } })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError("success", `El fondo de la imagen de bienvenida se ha establecido correctamente`),
                                    color: 0x00ff00,
                                    image: {
                                        url: option.attachment.url
                                    }
                                }]
                            })
                        } else if (imgWlc.background.data == option.value) {
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError("error", "no puedes poner una imagen igual a la anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { background: { tipo: "image", data: option.value } })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError("success", "El fondo de la imagen de bienvenida se ha establecido correctamente"),
                                    color: 0x00ff00,
                                    image: {
                                        url: option.value
                                    }
                                }]
                            })
                        }
                        break;
                    case "color":
                        let hex_color = option.value.toLowerCase();
                        if (!regex_c.test(hex_color)) return await interaction.reply({
                            embeds: [{
                                description: config.statusError('error', `El ${hex_color} es invalido o no es un color`),
                                color: 0xff0000
                            }]
                        });
                        let image = await newColorImage(hex_color);
                        imgWlc = await config.schemas.Welcome.findOne({ guildID: interaction.guildId })
                        if (imgWlc == null) {
                            let WlcDb = new config.schemas.Welcome({
                                guildID: interaction.guildId,
                                message: null,
                                type: null,
                                background: {
                                    tipo: "color",
                                    data: hex_color
                                },
                                color: {
                                    title: null,
                                    description: null,
                                    avatar: null
                                },
                                description: null,
                                title: null
                            })
                            await WlcDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError("success", `El fondo de la imagen de bienvenida se ha establecido ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [image.attachment]
                            })
                        } else if (imgWlc.background.data == null) {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { background: { tipo: "color", data: hex_color } })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError("success", `El fondo de la imagen de bienvenida se ha establecido ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [image.attachment]
                            })
                        } else if (imgWlc.background.data == hex_color) {
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError("error", "no puedes poner un color de fondo igual al anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { background: { tipo: "color", data: hex_color } })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError("success", `El fondo de la imagen de bienvenida se ha establecido ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [image.attachment]
                            })
                        }
                        break;
                    case "delete":
                        imgWlc = await config.schemas.Welcome.findOne({ guildID: interaction.guildId })
                        switch (option.value) {
                            case true:
                                if (imgWlc == null) return await interaction.reply({
                                    embeds: [{
                                        description: config.statusError("error", "tu no cuentas con un sistema de bienvenidas"),
                                        color: 0xff0000
                                    }]
                                })
                                if (imgWlc.background.data == null) return await interaction.reply({
                                    embeds: [{
                                        description: config.statusError("error", "parece que no tienes ningun fondo de bienvenida establecido"),
                                        color: 0xff0000
                                    }]
                                })
                                await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { background: { tipo: null, data: null } });
                                await interaction.reply({
                                    embeds: [{
                                        description: config.statusError("success", "se ha eliminado el fondo personalizado para la bienvenida"),
                                        color: 0x00ff00
                                    }]
                                });
                                break;
                            case false:
                                await interaction.reply({
                                    embeds: [{
                                        description: config.statusError("success", "no se eliminara el fondo personalizado para la bienvenida"),
                                        color: 0x00ff00
                                    }]
                                })
                                break;
                        }
                        break;
                    default: _replytobackground();
                }
                break;
            case "avatar":
                const _replytoavatar = async () => {
                    await interaction.reply({
                        embeds: [{
                            title: "necesitas ayuda?",
                            color: randomColor(),
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.avatarURL({ forceStatic: false })
                            },
                            description: "Estas en el menu de ayuda para este comando! asi que debes saber que para el comando /set welcome avatar hay dos opciones de las cuales debes responder solo una",
                            fields: [{
                                name: "color",
                                value: "Aqui puedes establecer un color para el anillo del avatar, solo basta con seleccionar este parametro y escribir el color que quieras en hexadecimal, puedes guiarte de [HTML color codes](https://htmlcolorcodes.com/), un ejemplo de un color es #ff0000 (rojo)"
                            }, {
                                name: "delete",
                                value: "Si haz establecido un color y no te gusto puedes eliminarlo con esta opcion, esta misma solo acepta dos valores dados en la lista emergente que sale... `True` | `False` si estas seguro de eliminar el color selecciona true, de lo contrario selecciona false o ignora el comando"
                            }]
                        }]
                    })
                }
                if (interaction.options._hoistedOptions.length <= 0) return await _replytoavatar();
                option = interaction.options._hoistedOptions[0];
                let avatarWlc;
                switch (option.name) {
                    case "color":
                        let hex_color = option.value.toLowerCase();
                        if (!regex_c.test(hex_color)) return await interaction.reply({
                            embeds: [{
                                description: config.statusError('error', `El ${hex_color} es invalido o no es un color`),
                                color: 0xff0000
                            }]
                        });
                        let image = await newColorImage(hex_color);
                        avatarWlc = await config.schemas.Welcome.findOne({ guildID: interaction.guildId })
                        if (!avatarWlc) {
                            let WlcDb = new config.schemas.Welcome({
                                guildID: interaction.guildId,
                                message: null,
                                type: null,
                                background: {
                                    tipo: null,
                                    data: null
                                },
                                color: {
                                    title: null,
                                    description: null,
                                    avatar: hex_color
                                },
                                description: null,
                                title: null
                            })
                            await WlcDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `el color del anillo del avatar se ha establecido correctamente a ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [
                                    image.attachment
                                ]
                            })
                        } else if (avatarWlc.color.avatar == null) {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { color: { title: avatarWlc.color.title, description: avatarWlc.color.description, avatar: hex_color } })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `el color del anillo del avatar se ha establecido correctamente a ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [
                                    image.attachment
                                ]
                            })
                        } else if (hex_color == avatarWlc.color.avatar) {
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('error', "el color que haz seleccionado es igual al anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { color: { title: avatarWlc.color.title, description: avatarWlc.color.description, avatar: hex_color } })
                            await interaction.reply({
                                embeds: [{
                                    description: config.statusError('success', `el color del anillo del avatar se ha establecido correctamente a ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [
                                    image.attachment
                                ]
                            })
                        }
                        break;
                    case "delete":
                        avatarWlc = await config.schemas.Welcome.findOne({ guildID: interaction.guildId })
                        switch (option.value) {
                            case true:
                                if (avatarWlc == null) return await interaction.reply({
                                    embeds: [{
                                        description: config.statusError("error", "tu no cuentas con un sistema de bienvenidas"),
                                        color: 0xff0000
                                    }]
                                })
                                if (avatarWlc.color.avatar == null) return await interaction.reply({
                                    embeds: [{
                                        description: config.statusError("error", "parece que no tienes ningun color para el aniño del avatar establecido"),
                                        color: 0xff0000
                                    }]
                                })
                                await config.schemas.Welcome.updateOne({ guildID: interaction.guildId }, { color: { title: avatarWlc.color.title, description: avatarWlc.color.description, avatar: null } });
                                await interaction.reply({
                                    embeds: [{
                                        description: config.statusError("success", "se ha eliminado el color personalizado para el aniño del avatar"),
                                        color: 0x00ff00
                                    }]
                                });
                                break;
                            case false:
                                await interaction.reply({
                                    embeds: [{
                                        description: config.statusError("success", "no se eliminara el color personalizado para el aniño del avatar"),
                                        color: 0x00ff00
                                    }]
                                })
                                break;
                        }
                        break;
                    default: await _replytoavatar();
                }
                break;
            case "test":
                let testWelcome = parseJson(await config.schemas.Welcome.findOne({ guildID: interaction.guildId }))
                if (!testWelcome) return await interaction.reply({
                    embeds: [{
                        description: config.statusError("warn", "para ejecutar este comando deberias de tener un sistema de bienvenidas establecido"),
                        color: 0xffff00
                    }]
                });
                if (testWelcome.type == null || testWelcome.type == "image") {
                    let welcome = new nekoapi.Welcome()
                        .setTitle(replaces_msg_i(interaction, testWelcome.title), testWelcome.colors.title, 45)
                        .setAvatar(interaction.user.avatar ? interaction.user.avatarURL({ forceStatic: true, extension: "png" }) : defaultAvatar, testWelcome.colors.avatar)
                        .setDescription(replaces_msg_i(interaction, testWelcome.description), testWelcome.colors.description, 35)
                        .setBackground(testWelcome.background.type, testWelcome.background.data)
                    let attach = new discord.AttachmentBuilder()
                        .setFile(await welcome.get()).setName(`bienvenido_${interaction.user.id}.png`)
                    if (!testWelcome.message) return await interaction.reply({
                        files: [attach]
                    }); else await interaction.reply({
                        content: replaces_msg_i(interaction, testWelcome.message),
                        files: [attach],
                        allowedMentions: {
                            parse: ['users']
                        }
                    });
                } else {
                    let embed = new discord.EmbedBuilder()
                    if (testWelcome.background.type == "color") {
                        embed.setColor(testWelcome.background.data)
                            .setImage(interaction.guild.banner ? interaction.guild.bannerURL({ forceStatic: false }) : null)
                    } else {
                        embed.setColor(randomColor())
                            .setImage(testWelcome.background.data)
                    }
                    embed.setAuthor({
                        name: interaction.guild.name,
                        iconURL: interaction.guild.iconURL({
                            forceStatic: false
                        })
                    })
                        .setTitle(replaces_msg_i(interaction, testWelcome.title))
                        .setThumbnail(interaction.user.avatar ? interaction.user.avatarURL({
                            forceStatic: false
                        }) : defaultAvatar)
                        .setDescription(replaces_msg_i(interaction, testWelcome.description))
                        .setTimestamp()
                    if (!testWelcome.message) return await interaction.reply({
                        embeds: [embed]
                    }); else await interaction.reply({
                        content: replaces_msg_i(interaction, testWelcome.message),
                        embeds: [embed],
                        allowedMentions: {
                            parse: ['users']
                        }
                    })
                }
                break;
            case "delete":
                option = interaction.options._hoistedOptions[0]
                let welcome, channels;
                switch (option.value) {
                    case true:
                        channels = await config.schemas.SetChannels.findOne({ guildID: interaction.guildId })
                        welcome = await config.schemas.Welcome.findOne({ guildID: interaction.guildId })
                        if (!welcome) return await interaction.reply({
                            embeds: [{
                                description: config.statusError('error', "no tienes un sistema de bienvenidas establecidos"),
                                color: 0xff0000
                            }]
                        })
                        if (!channels || channels.welcome == null) return await interaction.reply({
                            embeds: [{
                                description: config.statusError('error', "no tienes un canal de bienvenida establecido"),
                                color: 0xff0000
                            }]
                        })
                        await config.schemas.SetChannels.updateOne({ guildID: interaction.guildId }, { welcome: null })
                        await interaction.reply({
                            embeds: [{
                                description: config.statusError('success', "se ha eliminado solo el canal preterminado de bienvenidas de mi base de datos"),
                                color: 0x00ff00
                            }]
                        })
                        break;
                    case false:
                        channels = await config.schemas.SetChannels.findOne({ guildID: interaction.guildId })
                        welcome = await config.schemas.Welcome.findOne({ guildID: interaction.guildId })
                        if (!welcome) return await interaction.reply({
                            embeds: [{
                                description: config.statusError('error', "no tienes un sistema de bienvenidas establecido"),
                                color: 0xff0000
                            }]
                        })
                        if (!channels || channels == null) return await interaction.reply({
                            embeds: [{
                                description: config.statusError('error', "no tienes un canal de bienvenida establecido"),
                                color: 0xff0000
                            }]
                        })
                        await config.schemas.Welcome.deleteOne({ guildID: interaction.guildId })
                        await config.schemas.SetChannels.updateOne({ guildID: interaction.guildId }, { welcome: null })
                        await interaction.reply({
                            embeds: [{
                                description: config.statusError('success', "se ha eliminado el sistema completo de bienvenidas"),
                                color: 0x00ff00
                            }]
                        })
                        break;
                }
                break;
        }
    } catch (error) {
        await interactionErrorMsg(interaction, error);
    }
}