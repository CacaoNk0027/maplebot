// importaciones

const discord = require('discord.js')
const config = require('../../utils/exports')
const models = require('maplebot_models')
const ms = require('ms')
const { permissions } = require('../../utils/exports')

/**
 * exportacion del comando en text command
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        let prefix; try {
            prefix = await config.schemas.SetPrefix.findOne({ guildID: message.guildId }).exec().then(obj => obj.prefix)
        } catch (error) { prefix = "m!" };
        let comando = client.comandos.get(args[0]) || client.comandos.find(c => c.help.alias.includes(args[0])) || client.comandos.find(c => c.help.id == args[0])
        if (comando) {
            await message.reply({
                embeds: [{
                    author: {
                        name: message.author.username,
                        icon_url: message.author.avatarURL({ forceStatic: false })
                    },
                    color: 0xfcf5d4,
                    description: comando.help.description,
                    fields: [{
                        name: "Uso",
                        value: `\`\`\`\n${prefix}${comando.help.name} ${comando.help.options.length <= 0 ? "" : comando.help.options.map(c => `${c.required ? `<${c.name}>` : `[${c.name}]`}`).join(' ')}\n\`\`\``
                    }, {
                        name: `Permisos [Usuario]`,
                        value: `${comando.help.permissions.user.length >= 1 ? comando.help.permissions.user.map(c => `\`${permissions[c]}\``) : 'Ninguno'}`, inline: true
                    }, {
                        name: `Permisos [Bot]`,
                        value: `${comando.help.permissions.bot.length >= 1 ? comando.help.permissions.bot.map(c => `\`${permissions[c]}\``) : '???'}`, inline: true
                    }, {
                        name: "interfaz",
                        value: `\`\`\`\n[opcion] - Parametro Opcional\n<opcion> - Parametro Requerido\n\`\`\``
                    }, {
                        name: "Status",
                        value: `\`\`\`diff\n${comando.help.status.code == 0 ? `- Este comando esta inactivo!\nRazon: ${comando.help.status.reason}`: `+ Comando operando con normalidad`}\n\`\`\``
                    }],
                    footer: {
                        text: `reporta errores con /report`,
                        icon_url: message.guild.iconURL({ forceStatic: false })
                    },
                    title: `Comando | **${comando.help.name}**`
                }]
            })
        } else {
            const msg = await message.reply({
                embeds: [{
                    title: `Menu de ayuda | ❗📝`,
                    author: {
                        name: message.author.username,
                        icon_url: message.author.avatarURL({ forceStatic: false })
                    },
                    color: 0xfcf5d4,
                    description: `Menu de ayuda | selecciona una categoria del menu para ver los comandos disponibles en la misma\nsi quieres ver categorias nsfw debes de estar en un canal nsfw`,
                    footer: {
                        text: `Menus de ayuda | ${client.user.username}`,
                        icon_url: client.user.avatarURL()
                    }
                }],
                components: [{
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: "helpMenu",
                        placeholder: "Categorias",
                        options: config.menuOptions(message.channel)
                    }]
                }]
            })
            const collector = msg.createMessageComponentCollector({ time: ms('3m') })
            collector.on('collect', async (i) => {
                if (i.user.id !== message.author.id) return await i.reply({
                    content: models.utils.statusError('rolplayMe', "esta interaccion no va dirigida a ti"),
                    ephemeral: true
                }); else {
                    if (i.values[0] == "1") {
                        await i.reply({
                            embeds: [{
                                title: `Informacion | <:mkZero_writing:853296021098594325>`,
                                author: {
                                    name: message.author.username,
                                    icon_url: message.author.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda de Información |** comandos con los que pudes ver cosas de emojis, usuarios y servidores a detalle`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "informacion")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "2") {
                        await i.reply({
                            embeds: [{
                                title: `Utilidades | <a:mkDiamont:854799215993028668>`,
                                author: {
                                    name: message.author.username,
                                    icon_url: message.author.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda Utilidades |** comandos con los que puedes ver algunas cosas como avatares y etc`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "utilidad")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "3") {
                        await i.reply({
                            embeds: [{
                                title: `Diversión | <a:mkMinecraft:854799192131895297>`,
                                author: {
                                    name: message.author.username,
                                    icon_url: message.author.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda diversión |** comandos con los que puedes entretenerte o jugar uwu`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "diversion")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "4") {
                        await i.reply({
                            embeds: [{
                                title: `Moderación | <:Dis_bg_verifiedMod:888236515526844448>`,
                                author: {
                                    name: message.author.username,
                                    icon_url: message.author.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda moderación |** comandos que sirven para moderar tu servidor\n<:mtWarn:916316659105538068> Nota | \`estos comandos solo pueden ser usados por personas que tengan ciertos permisos necesarios\``,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "moderacion")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "5") {
                        await i.reply({
                            embeds: [{
                                title: `Anime | <:mtSmile:916315436755349524>`,
                                author: {
                                    name: message.author.username,
                                    icon_url: message.author.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda anime |** comandos con los que puedes mostrar imagenes de anime o mas cosas`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "anime")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "6") {
                        await i.reply({
                            embeds: [{
                                title: `Animales | <:mkGateto_que:852226706009882664>`,
                                author: {
                                    name: message.author.username,
                                    icon_url: message.author.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda animales |** quieres ver imagenes de animales lindos? ve los comandos de aqui uwu`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "animales")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "7") {
                        await i.reply({
                            embeds: [{
                                title: `Configuración | <:Dis_bg_employee:888238358118154270>`,
                                author: {
                                    name: message.author.username,
                                    icon_url: message.author.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda configuración |** quieres cambiar cosas como el prefix de la bot y etc pues quedate aqui\n<:mtWarn:916316659105538068> Nota | \`estos comandos solo pueden ser usados por personas que tengan ciertos permisos necesarios\``,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "configuracion")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "8") {
                        await i.reply({
                            embeds: [{
                                title: `Acción | <a:mkKelly_fight:854781850086277161>`,
                                author: {
                                    name: message.author.username,
                                    icon_url: message.author.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda acción |** comandos con los que puedes hacer una battalla o besar a alguien~`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "accion")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "9") {
                        await i.reply({
                            embeds: [{
                                title: `Reacción | <:mkMaple_shrug:836375140232724510>`,
                                author: {
                                    name: message.author.username,
                                    icon_url: message.author.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda reacción |** comandos con los que puedes dar like a algo o reaccionar a una cosa <:mkMaple_shrug:836375140232724510>`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "reaccion")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "10") {
                        await i.reply({
                            embeds: [{
                                title: `Música | <a:mkCat_jam:854782269737795624>`,
                                author: {
                                    name: message.author.username,
                                    icon_url: message.author.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda música |** Unete a un canal de voz y relajate escuchando música :3`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "musica")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "11") {
                        await i.reply({
                            embeds: [{
                                title: `Nsfw | <:mkZero_mmm:853975964123398144>`,
                                author: {
                                    name: message.author.username,
                                    icon_url: message.author.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda nsfw |** no hay mucho que explicar.. ya sabes que se hace aqui <:mkZero_mmm:853975964123398144>`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "nsfw")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "12") {
                        await i.reply({
                            embeds: [{
                                title: `Rolplay Nsfw | <:mkLove:869814289727381575>`,
                                author: {
                                    name: message.author.username,
                                    icon_url: message.author.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda rolplay nsfw |** no hay mucho que explicar.. ya sabes que se hace aqui <:mkZero_mmm:853975964123398144>`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "rolplaynsfw")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    }
                }
            })
            collector.on('end', async () => {
                await msg.edit({
                    components: [{
                        type: 1,
                        components: [{
                            type: 3,
                            custom_id: "helpMenu",
                            placeholder: "Interaccion Terminada",
                            options: [{
                                "label": "menu desactivado",
                                "description": "el menu ha sido desactivado",
                                "value": "13"
                            }],
                            disabled: true
                        }]
                    }]
                })
            })
        }
    } catch (error) {
        await models.utils.error(message, error); console.error(error); return 0;
    }
}

/**
 * exportacion del comando en slash command
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {
    try {
        let prefix; try {
            prefix = await config.schemas.SetPrefix.findOne({ guildID: interaction.guildId }).exec().then(obj => obj.prefix)
        } catch (error) { prefix = "m!" }
        let option = interaction.options.get('comando', false)
        if(option !== null ) {
            let comando = client.comandos.get(option.value.toLowerCase()) || client.comandos.find(c => c.help.alias.includes(option.value.toLowerCase())) || client.comandos.find(c => c.help.id == option.value.toLowerCase())
            if(!comando) await interaction.reply({
                content: models.utils.statusError('rolplayDanger', `no he podido reconocer el comando **${option.value.toLowerCase()}**`),
                ephemeral: true
            }); else await interaction.reply({
                embeds: [{
                    author: {
                        name: interaction.user.username,
                        icon_url: interaction.user.avatarURL({ forceStatic: false })
                    },
                    color: 0xfcf5d4,
                    description: comando.help.description,
                    fields: [{
                        name: "Uso",
                        value: `\`\`\`\n${prefix}${comando.help.name} ${comando.help.options.length <= 0 ? "" : comando.help.options.map(c => `${c.required ? `<${c.name}>` : `[${c.name}]`}`).join(' ')}\n\`\`\``
                    }, {
                        name: `Permisos [Usuario]`,
                        value: `${comando.help.permissions.user.length >= 1 ? comando.help.permissions.user.map(c => `\`${permissions[c]}\``) : 'Ninguno'}`, inline: true
                    }, {
                        name: `Permisos [Bot]`,
                        value: `${comando.help.permissions.bot.length >= 1 ? comando.help.permissions.bot.map(c => `\`${permissions[c]}\``) : '???'}`, inline: true
                    }, {
                        name: "interfaz",
                        value: `\`\`\`\n[opcion] - Parametro Opcional\n<opcion> - Parametro Requerido\n\`\`\``
                    }, {
                        name: "Status",
                        value: `\`\`\`diff\n${comando.help.status.code == 0 ? `- Este comando esta inactivo!\nRazon: ${comando.help.status.reason}`: `+ Comando operando con normalidad`}\n\`\`\``
                    }],
                    footer: {
                        text: "reporta errores con /report",
                        icon_url: interaction.guild.iconURL({ forceStatic: false })
                    },
                    title: `Comando | **${comando.help.name}**`
                }],
                ephemeral: true
            })
        } else {
            const msg = await interaction.reply({
                embeds: [{
                    title: `Menu de ayuda | ❗📝`,
                    author: {
                        name: interaction.user.username,
                        icon_url: interaction.user.avatarURL({ forceStatic: false })
                    },
                    color: 0xfcf5d4,
                    description: `Menu de ayuda | selecciona una categoria del menu para ver los comandos disponibles en la misma\nsi quieres ver categorias nsfw debes de estar en un canal nsfw`,
                    footer: {
                        text: `Menus de ayuda | ${client.user.username}`,
                        icon_url: client.user.avatarURL()
                    }
                }],
                components: [{
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: "helpMenu",
                        placeholder: "Categorias",
                        options: config.menuOptions(interaction.channel)
                    }]
                }]
            })
            const collector = msg.createMessageComponentCollector({ time: ms('5m') });
            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) return await i.reply({
                    content: models.utils.statusError('rolplayMe', "esta interaccion no va dirigida a ti"),
                    ephemeral: true
                }); else {
                    if (i.values[0] == "1") {
                        await i.reply({
                            embeds: [{
                                title: `Informacion | <:mkZero_writing:853296021098594325>`,
                                author: {
                                    name: interaction.user.username,
                                    icon_url: interaction.user.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda de Información |** comandos con los que pudes ver cosas de emojis, usuarios y servidores a detalle`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "informacion")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "2") {
                        await i.reply({
                            embeds: [{
                                title: `Utilidades | <a:mkDiamont:854799215993028668>`,
                                author: {
                                    name: interaction.user.username,
                                    icon_url: interaction.user.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda Utilidades |** comandos con los que puedes ver algunas cosas como avatares y etc`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "utilidad")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "3") {
                        await i.reply({
                            embeds: [{
                                title: `Diversión | <a:mkMinecraft:854799192131895297>`,
                                author: {
                                    name: interaction.user.username,
                                    icon_url: interaction.user.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda diversión |** comandos con los que puedes entretenerte o jugar uwu`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "diversion")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "4") {
                        await i.reply({
                            embeds: [{
                                title: `Moderación | <:Dis_bg_verifiedMod:888236515526844448>`,
                                author: {
                                    name: interaction.user.username,
                                    icon_url: interaction.user.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda moderación |** comandos que sirven para moderar tu servidor\n<:mtWarn:916316659105538068> Nota | \`estos comandos solo pueden ser usados por personas que tengan ciertos permisos necesarios\``,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "moderacion")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "5") {
                        await i.reply({
                            embeds: [{
                                title: `Anime | <:mtSmile:916315436755349524>`,
                                author: {
                                    name: interaction.user.username,
                                    icon_url: interaction.user.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda anime |** comandos con los que puedes mostrar imagenes de anime o mas cosas`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "anime")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "6") {
                        await i.reply({
                            embeds: [{
                                title: `Animales | <:mkGateto_que:852226706009882664>`,
                                author: {
                                    name: interaction.user.username,
                                    icon_url: interaction.user.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda animales |** quieres ver imagenes de animales lindos? ve los comandos de aqui uwu`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "animales")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "7") {
                        await i.reply({
                            embeds: [{
                                title: `Configuración | <:Dis_bg_employee:888238358118154270>`,
                                author: {
                                    name: interaction.user.username,
                                    icon_url: interaction.user.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda configuración |** quieres cambiar cosas como el prefix de la bot y etc pues quedate aqui\n<:mtWarn:916316659105538068> Nota | \`estos comandos solo pueden ser usados por personas que tengan ciertos permisos necesarios\``,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "configuracion")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "8") {
                        await i.reply({
                            embeds: [{
                                title: `Acción | <a:mkKelly_fight:854781850086277161>`,
                                author: {
                                    name: interaction.user.username,
                                    icon_url: interaction.user.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda acción |** comandos con los que puedes hacer una battalla o besar a alguien~`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "accion")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "9") {
                        await i.reply({
                            embeds: [{
                                title: `Reacción | <:mkMaple_shrug:836375140232724510>`,
                                author: {
                                    name: interaction.user.username,
                                    icon_url: interaction.user.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda reacción |** comandos con los que puedes dar like a algo o reaccionar a una cosa <:mkMaple_shrug:836375140232724510>`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "reaccion")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "10") {
                        await i.reply({
                            embeds: [{
                                title: `Música | <a:mkCat_jam:854782269737795624>`,
                                author: {
                                    name: interaction.user.username,
                                    icon_url: interaction.user.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda música |** Unete a un canal de voz y relajate escuchando música :3`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "music")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "11") {
                        await i.reply({
                            embeds: [{
                                title: `Nsfw | <:mkZero_mmm:853975964123398144>`,
                                author: {
                                    name: interaction.user.username,
                                    icon_url: interaction.user.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda nsfw |** no hay mucho que explicar.. ya sabes que se hace aqui <:mkZero_mmm:853975964123398144>`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "nsfw")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    } else if (i.values[0] == "12") {
                        await i.reply({
                            embeds: [{
                                title: `Rolplay Nsfw | <:mkLove:869814289727381575>`,
                                author: {
                                    name: interaction.user.username,
                                    icon_url: interaction.user.avatarURL({ forceStatic: false })
                                },
                                color: 0xfcf5d4,
                                description: `**Menu de ayuda rolplay nsfw |** no hay mucho que explicar.. ya sabes que se hace aqui <:mkZero_mmm:853975964123398144>`,
                                fields: [{
                                    name: "Comandos",
                                    value: config.helpcommands(prefix, client.comandos, "rolplaynsfw")
                                }],
                                footer: {
                                    text: `Menus de ayuda | ${client.user.username}`,
                                    icon_url: client.user.avatarURL()
                                }
                            }],
                            ephemeral: true
                        })
                    }
                }
            })
            collector.on('end', async (i) => {
                await interaction.editReply({
                    components: [{
                        type: 1,
                        components: [{
                            type: 3,
                            custom_id: "helpMenu",
                            placeholder: "Interaccion Terminada",
                            options: [{
                                "label": "menu desactivado",
                                "description": "el menu ha sido desactivado",
                                "value": "13"
                            }],
                            disabled: true
                        }]
                    }]
                })
            })
        }
    } catch (error) {
        await interactionErrorMsg(interaction, error);
    }
}

/**
 * exportacion del arreglo help
 */
exports.help = {
    // nombre, alias e id del comando
    name: "help",
    alias: ["ayuda"],
    id: "002",
    // description y categoria del comando
    description: "ve el menu de ayuda que proporciona la bot ⛑",
    category: "informacion",
    // opciones y permisos
    options: [{ name: "comando", required: false }],
    permissions: {
        user: [],
        bot: ["SendMessages", "EmbedLinks"],
    },
    // configuraciones ( status, es nsfw?, contiene embeds?, cooldown )
    status: {
        code: 1, // codigo 1 es comando en operacion, codigo 0 es comando desabilitado
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}