const discord = require('discord.js')
const models = require('maplebot_models')
const config = require('../../utils/exports')
const ms = require('ms')

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        const server = await message.guild.fetch();
        let nivel, boost;
        switch (server.verificationLevel) {
            case 0: nivel = "Ninguno"; break;
            case 1: nivel = "Bajo"; break;
            case 2: nivel = "Medio"; break;
            case 3: nivel = "(╯°□°）╯︵  ┻━┻"; break;
            case 4: nivel = "┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻"; break;
            default: nivel = "Ninguno";
        }; switch (server.premiumTier) {
            case 0: boost = "Sin nivel"; break;
            case 1: boost = "<:Dis_boostLv1:888234250757890099> Nivel 1"; break;
            case 2: boost = "<:Dis_boostLv2:888234340121727006> Nivel 2"; break;
            case 3: boost = "<:Dis_boostLv3:888234376226295878> Nivel 3"; break;
            default: boost = "Sin nivel"; break;
        };
        let embeds = [{
            author: {
                name: server.name,
                icon_url: server.iconURL({ forceStatic: false })
            },
            color: 0xfcf5d4,
            description: await models.menus.guilds.guilds(client, server),
            fields: [{
                name: "Canales",
                value: `<:Dis_channelText:888230498214760509> **Texto |** ${server.channels.cache.filter(ch => ch.type == 0).size}\n<:Dis_channelVoice:888230649977266209> **Voz |** ${server.channels.cache.filter(ch => ch.type == 2).size}\n<:Dis_addChannel:888234000093691944> **Categorias |** ${server.channels.cache.filter(ch => ch.type == 4).size}`,
                inline: true
            }, {
                name: "Miembros",
                value: `🌐 **Usuarios |** ${server.memberCount}\n👤 **Miembros |** ${(await server.members.fetch()).filter(f => !f.user.bot).size}\n🤖 **Bots |** ${(await server.members.fetch()).filter(u => u.user.bot).size}`,
                inline: true
            }, {
                name: "Premium ( Boost )",
                value: `<a:Disc_discordBoost:888250051858661466> **Nivel |** ${boost}\n<:discord_nitro_boost:819054610542755840> **Mejoras |** ${server.premiumSubscriptionCount}`,
                inline: true
            }, {
                name: "Detalles",
                value: models.menus.guilds.general(server, nivel),
                inline: true
            }, {
                name: "Imagenes",
                value: `🌆 **icono |** ${server.icon == null ? `El servidor no tiene icono` : `[Icono URL](${server.iconURL({ forceStatic: false })})`}\n🌆 **banner |** ${server.banner == null ? "sin banner" : `[Banner URL](${server.bannerURL({ size: 1024 })})`}`,
                inline: true
            }],
            footer: {
                text: `General | ${message.author.username}`,
                icon_url: message.author.avatarURL({ forceStatic: false }),
            },
            thumbnail: {
                url: server.iconURL({ forceStatic: false })
            }
        }, {
            author: {
                name: server.name,
                icon_url: server.iconURL({ forceStatic: false })
            },
            color: 0xfcf5d4,
            description: await models.menus.guilds.guilds(client, server),
            fields: [{
                name: "Datos Especificos",
                value: models.menus.guilds.datos(server)
            }],
            footer: {
                text: `Especificaciones | ${message.author.username}`,
                icon_url: message.author.avatarURL({ forceStatic: false })
            },
            thumbnail: {
                url: server.iconURL({ forceStatic: false })
            }
        }, {
            author: {
                name: server.name,
                icon_url: server.iconURL({ forceStatic: false })
            },
            color: 0xfcf5d4,
            description: await models.menus.guilds.guilds(client, server),
            fields: [{
                name: "Comunidad",
                value: models.menus.guilds.comunidad(server, message.member),
                inline: true
            }],
            footer: {
                text: `Comunidad | ${message.author.username}`,
                icon_url: message.author.avatarURL({ forceStatic: false }),
            },
            thumbnail: {
                url: server.iconURL({ forceStatic: false })
            }
        }]
        const msg = await message.reply({
            embeds: [embeds[0]],
            components: [{
                type: 1,
                components: [{
                    type: 3,
                    custom_id: "GuildMenu",
                    placeholder: "Selecciona una opcion del menu",
                    options: config.guildMenuOptions(server)
                }]
            }]
        })
        const collector = msg.createMessageComponentCollector({ time: ms('5m') });
        collector.on('collect', async (i) => {
            if (i.user.id !== message.author.id) return await i.reply({
                ephemeral: true,
                content: models.utils.statusError('error', "Esta interacción no es para ti")
            }); else {
                i.deferUpdate();
                let number = parseInt(i.values[0]) - 1;
                await msg.edit({
                    embeds: [embeds[number]]
                })
            }
        })
        collector.on('end', async () => {
            await msg.edit({
                components: [{
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: "GuildMenu",
                        placeholder: "interaccion terminada",
                        disabled: true,
                    }]
                }]
            })
        })
    } catch (error) {
        console.log(error)
        await models.utils.error(message, error)
    }
}

/**
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {
    try {
        const server = await interaction.guild.fetch();
        let nivel, boost;
        switch (server.verificationLevel) {
            case 0: nivel = "Ninguno"; break;
            case 1: nivel = "Bajo"; break;
            case 2: nivel = "Medio"; break;
            case 3: nivel = "(╯°□°）╯︵  ┻━┻"; break;
            case 4: nivel = "┻━┻ミヽ(ಠ益ಠ)ノ彡┻━┻"; break;
            default: nivel = "Ninguno";
        }; switch (server.premiumTier) {
            case 0: boost = "Sin nivel"; break;
            case 1: boost = "<:Dis_boostLv1:888234250757890099> Nivel 1"; break;
            case 2: boost = "<:Dis_boostLv2:888234340121727006> Nivel 2"; break;
            case 3: boost = "<:Dis_boostLv3:888234376226295878> Nivel 3"; break;
            default: boost = "Sin nivel"; break;
        };
        let embeds = [{
            author: {
                name: server.name,
                icon_url: server.iconURL({ forceStatic: false })
            },
            color: 0xfcf5d4,
            description: await models.menus.guilds.guilds(client, server),
            fields: [{
                name: "Canales",
                value: `<:Dis_channelText:888230498214760509> **Texto |** ${server.channels.cache.filter(ch => ch.type == 0).size}\n<:Dis_channelVoice:888230649977266209> **Voz |** ${server.channels.cache.filter(ch => ch.type == 2).size}\n<:Dis_addChannel:888234000093691944> **Categorias |** ${server.channels.cache.filter(ch => ch.type == 4).size}`,
                inline: true
            }, {
                name: "Miembros",
                value: `🌐 **Usuarios |** ${server.memberCount}\n👤 **Miembros |** ${(await server.members.fetch()).filter(f => !f.user.bot).size}\n🤖 **Bots |** ${(await server.members.fetch()).filter(u => u.user.bot).size}`,
                inline: true
            }, {
                name: "Premium ( Boost )",
                value: `<a:Disc_discordBoost:888250051858661466> **Nivel |** ${boost}\n<:discord_nitro_boost:819054610542755840> **Mejoras |** ${server.premiumSubscriptionCount}`,
                inline: true
            }, {
                name: "Detalles",
                value: models.menus.guilds.general(server, nivel),
                inline: true
            }, {
                name: "Imagenes",
                value: `🌆 **icono |** ${server.icon == null ? `El servidor no tiene icono` : `[Icono URL](${server.iconURL({ forceStatic: false })})`}\n🌆 **banner |** ${server.banner == null ? "sin banner" : `[Banner URL](${server.bannerURL({ size: 1024 })})`}`,
                inline: true
            }],
            footer: {
                text: `General | ${interaction.user.username}`,
                icon_url: interaction.user.avatarURL({ forceStatic: false }),
            },
            thumbnail: {
                url: server.iconURL({ forceStatic: false })
            }
        }, {
            author: {
                name: server.name,
                icon_url: server.iconURL({ forceStatic: false })
            },
            color: 0xfcf5d4,
            description: await models.menus.guilds.guilds(client, server),
            fields: [{
                name: "Datos Especificos",
                value: models.menus.guilds.datos(server)
            }],
            footer: {
                text: `Especificaciones | ${interaction.user.username}`,
                icon_url: interaction.user.avatarURL({ forceStatic: false })
            },
            thumbnail: {
                url: server.iconURL({ forceStatic: false })
            }
        }, {
            author: {
                name: server.name,
                icon_url: server.iconURL({ forceStatic: false })
            },
            color: 0xfcf5d4,
            description: await models.menus.guilds.guilds(client, server),
            fields: [{
                name: "Comunidad",
                value: models.menus.guilds.comunidad(server, interaction.member),
                inline: true
            }],
            footer: {
                text: `Comunidad | ${interaction.user.username}`,
                icon_url: interaction.user.avatarURL({ forceStatic: false }),
            },
            thumbnail: {
                url: server.iconURL({ forceStatic: false })
            }
        }]
        const msg = await interaction.reply({
            embeds: [embeds[0]],
            components: [{
                type: 1,
                components: [{
                    type: 3,
                    custom_id: "GuildMenu",
                    placeholder: "Selecciona una opcion del menu",
                    options: config.guildMenuOptions(server)
                }]
            }]
        })
        const collector = msg.createMessageComponentCollector({ time: ms('5m') });
        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id) return await i.reply({
                ephemeral: true,
                content: models.utils.statusError('error', "Esta interacción no es para ti")
            }); else {
                i.deferUpdate();
                let number = parseInt(i.values[0]) - 1;
                await msg.edit({
                    embeds: [embeds[number]]
                })
            }
        })
        collector.on('end', async () => {
            await msg.edit({
                components: [{
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: "GuildMenu",
                        placeholder: "interaccion terminada",
                        disabled: true,
                    }]
                }]
            })
        })
    } catch (error) {
        console.error(error)
        await config.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    name: 'serverinfo',
    alias: ['server', 'servidor'],
    id: '006',
    description: 'Muestra informacion del servidor actual',
    category: 'informacion',
    options: [],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks', 'ViewGuildInsights']
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}