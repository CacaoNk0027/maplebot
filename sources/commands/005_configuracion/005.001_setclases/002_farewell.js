const discord = require('discord.js');
const models = require('maplebot_models');
const regex_c = require('hex-color-regex')({ strict: true });
const nekoapi = require('nekoapi.beta')
const config = require('../../../utils/exports')
const {
    replaces_msg_i,
    randomColor,
    newColorImage,
    interactionErrorMsg,
    defaultAvatar,
    farewellJson
} = require('../../../utils/exports');

/**
 * @param {discord.Client} client
 * @param {discord.CommandInteraction} interaction
 */
exports.Farewell = async (client, interaction) => {
    try {
        let option;
        switch (interaction.options._subcommand) {
            case "channel":
                option = interaction.options._hoistedOptions[0]
                let channel = await client.channels.fetch(option.value);
                if (channel.type != discord.ChannelType.GuildText) return await interaction.reply({
                    embeds: [{
                        description: models.utils.statusError('error', "no puedes poner un canal que no sea de texto"),
                        color: 0xff0000
                    }]
                });
                if (!channel.permissionsFor(client.user.id).has(discord.PermissionFlagsBits.SendMessages)) return await interaction.reply({
                    embeds: [{
                        description: models.utils.statusError('error', "no puedes establecer un canal que no puedo ver o en el que no puedo hablar"),
                        color: 0xff0000
                    }]
                });
                if (await config.schemas.Farewell.findOne({ guildID: interaction.guildId }) == null) {
                    let FrwDb = new config.schemas.Farewell({
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
                    await FrwDb.save();
                }
                let channelFrw = await config.schemas.SetChannels.findOne({ guildID: interaction.guildId });
                if (channelFrw == null) {
                    let ChannelDb = new config.schemas.SetChannels({
                        guildID: interaction.guildId,
                        suggest: null,
                        confession: null,
                        welcome: null,
                        farewell: channel.id
                    });
                    await ChannelDb.save();
                    await interaction.reply({
                        embeds: [{
                            description: models.utils.statusError('success', `Se ha establecido <#${channel.id}> como preterminado para despedidas`),
                            color: 0x00ff00
                        }]
                    })
                } else if (channelFrw.farewell == null) {
                    await config.schemas.SetChannels.updateOne({ guildID: interaction.guildId }, { farewell: channel.id })
                    await interaction.reply({
                        embeds: [{
                            description: models.utils.statusError('success', `Se ha establecido <#${channel.id}> como preterminado para despedidas`),
                            color: 0x00ff00
                        }]
                    })
                } else if (channelFrw == channel.id) {
                    await interaction.reply({
                        embeds: [{
                            description: models.utils.statusError('error', `El canal que haz seleccionado es exactamente igual al canal que haz establecido anteriormente`),
                            color: 0xff0000
                        }]
                    })
                } else {
                    await config.schemas.SetChannels.updateOne({ guildID: interaction.guildId }, { farewell: channel.id })
                    await interaction.reply({
                        embeds: [{
                            description: models.utils.statusError('success', `Se ha establecido <#${channel.id}> como preterminado para despedidas`),
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
                            description: "Estas en el menu de ayuda para este comando! asi que debes saber que para el comando /set farewell message hay dos opciones de las cuales debes responder solo una",
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
                                customId: "set.farewell.params",
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
                                    customId: "set.farewell.params",
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
                                description: models.utils.statusError('error', "no puedes poner mas de 300 palabras en el mensaje de despedida"),
                                color: 0xff0000
                            }]
                        })
                        let msgFrw_1 = await config.schemas.Farewell.findOne({ guildID: interaction.guildId })
                        if (msgFrw_1 == null) {
                            let FrwDb = new config.schemas.Farewell({
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
                            await FrwDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `El mensaje de despedida sera mostrado como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        } else if (msgFrw_1.message == null) {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { message: text })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `El mensaje de despedida sera mostrado como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        } else if (text == msgFrw_1.message) {
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('error', "no puedes escribir un mensaje similar o igual al anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { message: text })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `El mensaje de despedida sera mostrado como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        }
                        break;
                    case "delete":
                        switch (option.value) {
                            case true:
                                let msgFrw_2 = await config.schemas.Farewell.findOne({ guildID: interaction.guildId });
                                if (msgFrw_2 == null) return await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError("error", "no cuentas con un sistema de despedidas"),
                                        color: 0xff0000
                                    }]
                                });
                                if (msgFrw_2.message == null) return await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError('error', "no tienes un mensaje establecido"),
                                        color: 0xff0000
                                    }]
                                });
                                await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { message: null })
                                await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError('success', "el mensaje de despedida ha sido eliminado"),
                                        color: 0x00ff00
                                    }]
                                })
                                break;
                            case false:
                                await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError('error', "no se eliminara el mensaje de despedida"),
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
                let typeFrw = await config.schemas.Farewell.findOne({ guildID: interaction.guildId })
                if (typeFrw == null) {
                    let FrwDb = new config.schemas.Farewell({
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
                    await FrwDb.save();
                    await interaction.reply({
                        embeds: [{
                            description: models.utils.statusError('success', `Haz seleccionado el tipo de despedidas como **${type == "image" ? "Imagen" : "Embed"}**`),
                            color: 0x00ff00
                        }]
                    })
                } else if (typeFrw.type == null) {
                    await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { type: type })
                    await interaction.reply({
                        embeds: [{
                            description: models.utils.statusError('success', `Haz seleccionado el tipo de despedidas como **${type == "image" ? "Imagen" : "Embed"}**`),
                            color: 0x00ff00
                        }]
                    })
                } else if (type == typeFrw.type) {
                    await interaction.reply({
                        embeds: [{
                            description: models.utils.statusError('error', `Ya haz seleccionado ese tipo de despedida antes`),
                            color: 0xff0000
                        }]
                    })
                } else {
                    await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { type: type })
                    await interaction.reply({
                        embeds: [{
                            description: models.utils.statusError('success', `Haz seleccionado el tipo de despedidas como **${type == "image" ? "Imagen" : "Embed"}**`),
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
                            description: "Estas en el menu de ayuda para este comando! asi que debes saber que para el comando /set farewell description hay tres opciones de las cuales debes responder solo una",
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
                                customId: "set.farewell.params",
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
                                    customId: "set.farewell.params",
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
                                description: models.utils.statusError('error', "no puedes poner mas de 10 palabras en la descripcion de despedida"),
                                color: 0xff0000
                            }]
                        })
                        let descFrw_1 = await config.schemas.Farewell.findOne({ guildID: interaction.guildId })
                        if (descFrw_1 == null) {
                            let FrwDb = new config.schemas.Farewell({
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
                            await FrwDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `La descripcion de la despedida sera mostrada como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        } else if (descFrw_1.description == null) {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { description: text })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `La descripcion de la despedida sera mostrada como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        } else if (text == descFrw_1.description) {
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('error', "no puedes escribir una descripcion similar o igual al anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { description: text })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `La descripcion de la despedida sera mostrada como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        }
                        break;
                    case "color":
                        let hex_color = option.value.toLowerCase();
                        if (!regex_c.test(hex_color)) return await interaction.reply({
                            embeds: [{
                                description: models.utils.statusError('error', `El ${hex_color} es invalido o no es un color`),
                                color: 0xff0000
                            }]
                        });
                        let image = await newColorImage(hex_color);
                        let descFrw_2 = await config.schemas.Farewell.findOne({ guildID: interaction.guildId })
                        if (descFrw_2 == null) {
                            let FrwDb = new config.schemas.Farewell({
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
                            await FrwDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `el color de la descripcion se ha establecido correctamente a ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [
                                    image.attachment
                                ]
                            })
                        } else if (descFrw_2.color.description == null) {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { color: { title: descFrw_2.color.title, description: hex_color, avatar: descFrw_2.color.avatar } })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `el color de la descripcion se ha establecido correctamente a ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [
                                    image.attachment
                                ]
                            })
                        } else if (hex_color == descFrw_2.color.description) {
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('error', "el color que haz seleccionado es igual al anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { color: { title: descFrw_2.color.title, description: hex_color, avatar: descFrw_2.color.avatar } })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `el color de la descripcion se ha establecido correctamente a ${hex_color}`),
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
                                let descFrw_3 = await config.schemas.Farewell.findOne({ guildID: interaction.guildId });
                                if (descFrw_3 == null) return await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError("error", "no cuentas con un sistema de despedidas"),
                                        color: 0xff0000
                                    }]
                                });
                                if (descFrw_3.description == null) return await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError('error', "no tienes una descripcion establecida"),
                                        color: 0xff0000
                                    }]
                                });
                                await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { description: null })
                                await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError('success', "La descripcion de la despedida ha sido eliminada"),
                                        color: 0x00ff00
                                    }]
                                })
                                break;
                            case false:
                                await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError('error', "no se eliminara la descripcion de la despedida"),
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
                            description: "Estas en el menu de ayuda para este comando! asi que debes saber que para el comando /set farewell title hay tres opciones de las cuales debes responder solo una",
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
                                customId: "set.farewell.params",
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
                                    customId: "set.farewell.params",
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
                                description: models.utils.statusError('error', "no puedes poner mas de 3 palabras en la descripcion de despedida"),
                                color: 0xff0000
                            }]
                        })
                        let titFrw_1 = await config.schemas.Farewell.findOne({ guildID: interaction.guildId })
                        if (titFrw_1 == null) {
                            let FrwDb = new config.schemas.Farewell({
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
                            await FrwDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `El titulo de la despedida sera mostrado como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        } else if (titFrw_1.title == null) {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { title: text })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `El titulo de la despedida sera mostrado como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        } else if (text == titFrw_1.title) {
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('error', "no puedes escribir un titulo similar o igual al anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { title: text })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `El titulo de la despedida sera mostrado como acontinuacion...`) + `\n${replaces_msg_i(interaction, text)}`,
                                    color: 0x00ff00
                                }]
                            })
                        }
                        break;
                    case "color":
                        let hex_color = option.value.toLowerCase();
                        if (!regex_c.test(hex_color)) return await interaction.reply({
                            embeds: [{
                                description: models.utils.statusError('error', `El ${hex_color} es invalido o no es un color`),
                                color: 0xff0000
                            }]
                        });
                        let image = await newColorImage(hex_color);
                        let titFrw_2 = await config.schemas.Farewell.findOne({ guildID: interaction.guildId })
                        if (titFrw_2 == null) {
                            let FrwDb = new config.schemas.Farewell({
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
                            await FrwDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `el color del titulo se ha establecido correctamente a ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [
                                    image.attachment
                                ]
                            })
                        } else if (titFrw_2.color.title == null) {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { color: { title: hex_color, description: titFrw_2.color.description, avatar: titFrw_2.color.avatar } })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `el color del titulo se ha establecido correctamente a ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [
                                    image.attachment
                                ]
                            })
                        } else if (hex_color == titFrw_2.color.title) {
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('error', "el color que haz seleccionado es igual al anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { color: { title: hex_color, description: titFrw_2.color.description, avatar: titFrw_2.color.avatar } })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `el color del titulo se ha establecido correctamente a ${hex_color}`),
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
                                let titFrw_3 = await config.schemas.Farewell.findOne({ guildID: interaction.guildId });
                                if (titFrw_3 == null) return await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError("error", "no cuentas con un sistema de despedidas"),
                                        color: 0xff0000
                                    }]
                                });
                                if (titFrw_3.title == null) return await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError('error', "no tienes un titulo establecido"),
                                        color: 0xff0000
                                    }]
                                });
                                await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { title: null })
                                await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError('success', "el titulo de la despedida ha sido eliminada"),
                                        color: 0x00ff00
                                    }]
                                })
                                break;
                            case false:
                                await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError('error', "no se eliminara el titulo de la despedida"),
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
                            description: "Estas en el menu de ayuda para este comando! asi que debes saber que para el comando /set farewell background hay cuatro opciones de las cuales debes responder solo una",
                            fields: [{
                                name: "image",
                                value: "Lo que hace esta opcion es pedirte una imagen (puede ser cualquier archivo de imagen estatico), es recomentable tratar de calcular por tanteo el tamaño de la imagen para evitar deformidades en la misma, asi mismo, evita poner archivos no compartibles para no provocar errores"
                            }, {
                                name: "link",
                                value: "Puede que no tengas una imagen estatica pero si un link para una imagen, entonces elige esta opcion, al igual que con el parametro image, pega un link de una imagen estatica o de un archivo de imagen compartible, todo esto para evitar fallos en el sistema de despedidas"
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
                let imgFrw;
                switch (option.name) {
                    case "image":
                        if (!['jpg', 'jpeg', 'png', 'webp'].includes(option.attachment.name.split('.').pop())) return await interaction.reply({
                            embeds: [{
                                description: models.utils.statusError("error", "no puedo poner ese archivo ya que no tiene un formado compartible `jpg, jpeg, png, webp`, si la imagen tiene un archivo compartible trata de que sea reconocible"),
                                color: 0xff0000
                            }]
                        });
                        imgFrw = await config.schemas.Farewell.findOne({ guildID: interaction.guildId })
                        if (imgFrw == null) {
                            let FrwDb = new config.schemas.Farewell({
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
                            await FrwDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError("success", "El fondo de la imagen de despedida se ha establecido correctamente"),
                                    color: 0x00ff00,
                                    image: {
                                        url: option.attachment.url
                                    }
                                }]
                            })
                        } else if (imgFrw.background.data == null) {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { background: { tipo: "image", data: option.attachment.url } })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError("success", `El fondo de la imagen de despedida se ha establecido correctamente`),
                                    color: 0x00ff00,
                                    image: {
                                        url: option.attachment.url
                                    }
                                }]
                            })
                            // esta mierda de condicion se puede dar? no creo xdxd
                        } else if (imgFrw.background.data == option.attachment.url) {
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError("error", "no puedes poner una imagen igual a la anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { background: { tipo: "image", data: option.attachment.url } })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError("success", "El fondo de la imagen de despedida se ha establecido correctamente"),
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
                                description: models.utils.statusError("error", "no puedo poner ese archivo ya que no tiene un formado compartible `jpg, jpeg, png, webp`, si la imagen tiene un archivo compartible trata de que sea reconocible"),
                                color: 0xff0000
                            }]
                        });
                        imgFrw = await config.schemas.Farewell.findOne({ guildID: interaction.guildId })
                        if (imgFrw == null) {
                            let FrwDb = new config.schemas.Farewell({
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
                            await FrwDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError("success", "El fondo de la imagen de despedida se ha establecido correctamente"),
                                    color: 0x00ff00,
                                    image: {
                                        url: option.value
                                    }
                                }]
                            })
                        } else if (imgFrw.background.data == null) {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { background: { tipo: "image", data: option.value } })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError("success", `El fondo de la imagen de despedida se ha establecido correctamente`),
                                    color: 0x00ff00,
                                    image: {
                                        url: option.attachment.url
                                    }
                                }]
                            })
                        } else if (imgFrw.background.data == option.value) {
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError("error", "no puedes poner una imagen igual a la anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { background: { tipo: "image", data: option.value } })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError("success", "El fondo de la imagen de despedida se ha establecido correctamente"),
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
                                description: models.utils.statusError('error', `El ${hex_color} es invalido o no es un color`),
                                color: 0xff0000
                            }]
                        });
                        let image = await newColorImage(hex_color);
                        imgFrw = await config.schemas.Farewell.findOne({ guildID: interaction.guildId })
                        if (imgFrw == null) {
                            let FrwDb = new config.schemas.Farewell({
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
                            await FrwDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError("success", `El fondo de la imagen de despedida se ha establecido ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [image.attachment]
                            })
                        } else if (imgFrw.background.data == null) {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { background: { tipo: "color", data: hex_color } })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError("success", `El fondo de la imagen de despedida se ha establecido ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [image.attachment]
                            })
                        } else if (imgFrw.background.data == hex_color) {
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError("error", "no puedes poner un color de fondo igual al anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { background: { tipo: "color", data: hex_color } })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError("success", `El fondo de la imagen de despedida se ha establecido ${hex_color}`),
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
                        imgFrw = await config.schemas.Farewell.findOne({ guildID: interaction.guildId })
                        switch (option.value) {
                            case true:
                                if (imgFrw == null) return await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError("error", "tu no cuentas con un sistema de despedidas"),
                                        color: 0xff0000
                                    }]
                                })
                                if (imgFrw.background.data == null) return await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError("error", "parece que no tienes ningun fondo de despedida establecido"),
                                        color: 0xff0000
                                    }]
                                })
                                await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { background: { tipo: null, data: null } });
                                await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError("success", "se ha eliminado el fondo personalizado para la despedida"),
                                        color: 0x00ff00
                                    }]
                                });
                                break;
                            case false:
                                await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError("success", "no se eliminara el fondo personalizado para la despedida"),
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
                            description: "Estas en el menu de ayuda para este comando! asi que debes saber que para el comando /set farewell avatar hay dos opciones de las cuales debes responder solo una",
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
                let avatarFrw;
                switch (option.name) {
                    case "color":
                        let hex_color = option.value.toLowerCase();
                        if (!regex_c.test(hex_color)) return await interaction.reply({
                            embeds: [{
                                description: models.utils.statusError('error', `El ${hex_color} es invalido o no es un color`),
                                color: 0xff0000
                            }]
                        });
                        let image = await newColorImage(hex_color);
                        avatarFrw = await config.schemas.Farewell.findOne({ guildID: interaction.guildId })
                        if (!avatarFrw) {
                            let FrwDb = new config.schemas.Farewell({
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
                            await FrwDb.save();
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `el color del anillo del avatar se ha establecido correctamente a ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [
                                    image.attachment
                                ]
                            })
                        } else if (avatarFrw.color.avatar == null) {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { color: { title: avatarFrw.color.title, description: avatarFrw.color.description, avatar: hex_color } })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `el color del anillo del avatar se ha establecido correctamente a ${hex_color}`),
                                    color: parseInt(require('hex2dec').hexToDec(hex_color.replace("#", "0x"))),
                                    image: {
                                        url: image.embedUrl
                                    }
                                }],
                                files: [
                                    image.attachment
                                ]
                            })
                        } else if (hex_color == avatarFrw.color.avatar) {
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('error', "el color que haz seleccionado es igual al anterior"),
                                    color: 0xff0000
                                }]
                            })
                        } else {
                            await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { color: { title: avatarFrw.color.title, description: avatarFrw.color.description, avatar: hex_color } })
                            await interaction.reply({
                                embeds: [{
                                    description: models.utils.statusError('success', `el color del anillo del avatar se ha establecido correctamente a ${hex_color}`),
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
                        avatarFrw = await config.schemas.Farewell.findOne({ guildID: interaction.guildId })
                        switch (option.value) {
                            case true:
                                if (avatarFrw == null) return await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError("error", "tu no cuentas con un sistema de despedidas"),
                                        color: 0xff0000
                                    }]
                                })
                                if (avatarFrw.color.avatar == null) return await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError("error", "parece que no tienes ningun color para el aniño del avatar establecido"),
                                        color: 0xff0000
                                    }]
                                })
                                await config.schemas.Farewell.updateOne({ guildID: interaction.guildId }, { color: { title: avatarFrw.color.title, description: avatarFrw.color.description, avatar: null } });
                                await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError("success", "se ha eliminado el color personalizado para el aniño del avatar"),
                                        color: 0x00ff00
                                    }]
                                });
                                break;
                            case false:
                                await interaction.reply({
                                    embeds: [{
                                        description: models.utils.statusError("success", "no se eliminara el color personalizado para el aniño del avatar"),
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
                let testFarewell = farewellJson(await config.schemas.Farewell.findOne({ guildID: interaction.guildId }))
                if (!testFarewell) return await interaction.reply({
                    embeds: [{
                        description: models.utils.statusError("warn", "para ejecutar este comando deberias de tener un sistema de despedidas establecido"),
                        color: 0xffff00
                    }]
                });
                if (testFarewell.type == null || testFarewell.type == "image") {
                    let farewell = new nekoapi.Welcome()
                        .setTitle(replaces_msg_i(interaction, testFarewell.title), testFarewell.colors.title, 45)
                        .setAvatar(interaction.user.avatar ? interaction.user.avatarURL({ forceStatic: true, extension: "png" }) : defaultAvatar, testFarewell.colors.avatar)
                        .setDescription(replaces_msg_i(interaction, testFarewell.description), testFarewell.colors.description, 35)
                        .setBackground(testFarewell.background.type, testFarewell.background.data)
                    let attach = new discord.AttachmentBuilder()
                        .setFile(await farewell.get()).setName(`adios_${interaction.user.id}.png`)
                    if (!testFarewell.message) return await interaction.reply({
                        files: [attach]
                    }); else await interaction.reply({
                        content: replaces_msg_i(interaction, testFarewell.message),
                        files: [attach],
                        allowedMentions: {
                            parse: ['users']
                        }
                    });
                } else {
                    let embed = new discord.EmbedBuilder()
                    if (testFarewell.background.type == "color") {
                        embed.setColor(testFarewell.background.data)
                            .setImage(interaction.guild.banner ? interaction.guild.bannerURL({ forceStatic: false }) : null)
                    } else {
                        embed.setColor(randomColor())
                            .setImage(testFarewell.background.data)
                    }
                    embed.setAuthor({
                        name: interaction.guild.name,
                        iconURL: interaction.guild.iconURL({
                            forceStatic: false
                        })
                    })
                        .setTitle(replaces_msg_i(interaction, testFarewell.title))
                        .setThumbnail(interaction.user.avatar ? interaction.user.avatarURL({
                            forceStatic: false
                        }) : defaultAvatar)
                        .setDescription(replaces_msg_i(interaction, testFarewell.description))
                        .setTimestamp()
                    if (!testFarewell.message) return await interaction.reply({
                        embeds: [embed]
                    }); else await interaction.reply({
                        content: replaces_msg_i(interaction, testFarewell.message),
                        embeds: [embed],
                        allowedMentions: {
                            parse: ['users']
                        }
                    })
                }
                break;
            case "delete":
                option = interaction.options._hoistedOptions[0]
                let farewell, channels;
                switch (option.value) {
                    case true:
                        channels = await config.schemas.SetChannels.findOne({ guildID: interaction.guildId })
                        farewell = await config.schemas.Farewell.findOne({ guildID: interaction.guildId })
                        if (!farewell) return await interaction.reply({
                            embeds: [{
                                description: models.utils.statusError('error', "no tienes un sistema de despedidas establecidos"),
                                color: 0xff0000
                            }]
                        })
                        if (!channels || channels.farewell == null) return await interaction.reply({
                            embeds: [{
                                description: models.utils.statusError('error', "no tienes un canal de despedida establecido"),
                                color: 0xff0000
                            }]
                        })
                        await config.schemas.SetChannels.updateOne({ guildID: interaction.guildId }, { farewell: null })
                        await interaction.reply({
                            embeds: [{
                                description: models.utils.statusError('success', "se ha eliminado solo el canal preterminado de despedidas de mi base de datos"),
                                color: 0x00ff00
                            }]
                        })
                        break;
                    case false:
                        channels = await config.schemas.SetChannels.findOne({ guildID: interaction.guildId })
                        farewell = await config.schemas.Farewell.findOne({ guildID: interaction.guildId })
                        if (!farewell) return await interaction.reply({
                            embeds: [{
                                description: models.utils.statusError('error', "no tienes un sistema de despedidas establecido"),
                                color: 0xff0000
                            }]
                        })
                        if (!channels || channels == null) return await interaction.reply({
                            embeds: [{
                                description: models.utils.statusError('error', "no tienes un canal de despedida establecido"),
                                color: 0xff0000
                            }]
                        })
                        await config.schemas.Farewell.deleteOne({ guildID: interaction.guildId })
                        await config.schemas.SetChannels.updateOne({ guildID: interaction.guildId }, { farewell: null })
                        await interaction.reply({
                            embeds: [{
                                description: models.utils.statusError('success', "se ha eliminado el sistema completo de despedidas"),
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