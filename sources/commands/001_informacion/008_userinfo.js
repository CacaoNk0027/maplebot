const discord = require('discord.js')
const models = require('maplebot_models')
const configs = require('../../utils/exports')
const ms = require('ms')

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        const { user } = await configs.fetchUser({ message: message, args: args })
        if(!user) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `no se pudo encontrar el usuario especificado`),
                color: 0xff0000
            }]
        });
        const { member } = await configs.fetchMember({ message: message, id: user.id })
        if(!member) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `el usuario debe de ser miembro de este servidor`),
                color: 0xff0000
            }]
        });
        await message.reply({
            embeds: [{
                author: {
                    name: member.user.username,
                    icon_url: member.user.avatarURL({ forceStatic: false })
                },
                color: user.accentColor,
                description: models.menus.users.user(member),
                fields: [{
                    name: "Fecha de ingreso..",
                    value: models.menus.users.dates(member),
                    inline: false
                }, {
                    name: "General", 
                    value: (await models.menus.users.general(member)),
                    inline: true
                }, {
                    name: "Roles",
                    value: member.roles.cache.size >= 20 ? "Demasiados roles >~<\"": (member.roles.cache.filter(m => m.name !== "@everyone").size <= 0 ? "El usuario no cuenta con roles...": member.roles.cache.map(rol => `<@&${rol.id}>`).filter(m => m !== `<@&${message.guild.roles.everyone.id}>`).join(' ')),
                    inline: false
                }],
                thumbnail: {
                    url: member.user.avatarURL({ forceStatic: false })
                }
            }]
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
        const { options, user, guild, member } = interaction;

        let subcommand = options.getSubcommand();
        switch (subcommand) {
            case "info": {
                let target = options.getMember("usuario")
                if(target) {
                   await interaction.reply({
                        embeds: [{
                            author: {
                                name: target.displayName,
                                icon_url: target.user.avatarURL({ forceStatic: false })
                            },
                            color: user.accentColor,
                            description: models.menus.users.user(target),
                            fields: [{
                                name: "Fecha de ingreso..",
                                value: models.menus.users.dates(target),
                                inline: false
                            }, {
                                name: "General", 
                                value: (await models.menus.users.general(target)),
                                inline: true
                            }, {
                                name: "Roles",
                                value: target.roles.cache.size >= 20 ? "Demasiados roles >~<\"": (target.roles.cache.filter(m => m.name !== "@everyone").size <= 0 ? "El usuario no cuenta con roles...": target.roles.cache.map(rol => `<@&${rol.id}>`).filter(m => m !== `<@&${interaction.guild.roles.everyone.id}>`).join(' ')),
                                inline: false
                            }],
                            thumbnail: {
                                url: target.user.avatarURL({ forceStatic: false })
                            }
                        }]
                    })
                 } else {
                    await interaction.reply({
                        embeds: [{
                            author: {
                                name: member.user.username,
                                icon_url: member.user.avatarURL({ forceStatic: false })
                            },
                            color: user.accentColor,
                            description: models.menus.users.user(member),
                            fields: [{
                                name: "Fecha de ingreso..",
                                value: models.menus.users.dates(member),
                                inline: false
                            }, {
                                name: "General", 
                                value: (await models.menus.users.general(member)),
                                inline: true
                            }, {
                                name: "Roles",
                                value: member.roles.cache.size >= 20 ? "Demasiados roles >~<\"": (member.roles.cache.filter(m => m.name !== "@everyone").size <= 0 ? "El usuario no cuenta con roles...": member.roles.cache.map(rol => `<@&${rol.id}>`).filter(m => m !== `<@&${interaction.guild.roles.everyone.id}>`).join(' ')),
                                inline: false
                            }],
                            thumbnail: {
                                url: member.user.avatarURL({ forceStatic: false })
                            }
                        }]
                 })
                }
            }
            break;
            case "avatar": {
                let target = options.getMember("usuario") ? options.getMember('usuario'): interaction.member
                const userIsAuthor = () => target.user.id == interaction.user.id ? true : false;
                const memberIsAuthor = () => target.id == interaction.member.id ? true : false;
                let embeds = [{
                    title: userIsAuthor() ? 'Tu avatar': `Avatar de ${target.user.username}`,
                    description: `[Avatar URL](${target.user.avatarURL({ forceStatic: false, size: 2048 })})`,
                    color: configs.randomColor(),
                    author: {
                        name: target.user.username,
                        icon_url: target.user.avatarURL({ forceStatic: false })
                    },
                    image: {
                        url: target.user.avatarURL({ forceStatic: false, size: 2048 })
                    }
                }]
                if (target !== null && target.avatar !== null) embeds.push({
                    title: memberIsAuthor() ? 'Tu avatar de servidor' : `Avatar de ${target.user.username}`,
                    description: `[GuildAvatar URL](${target.avatarURL({ forceStatic: false, size: 2048 })})`,
                    color: configs.randomColor(),
                    author: {
                        name: target.user.username,
                        icon_url: target.avatarURL({ forceStatic: false })
                    },
                    image: {
                        url: target.avatarURL({ forceStatic: false, size: 2048 })
                    }
                });
                await interaction.reply({
                    embeds: [embeds[0]],
                    components: [{
                        type: discord.ComponentType.ActionRow,
                        components: embeds.length > 1 ? [{
                            type: 2,
                            custom_id: "userAvatar",
                            style: 1,
                            label: "Principal",
                            disabled: true
                        }, {
                            type: 2,
                            custom_id: "memberAvatar",
                            style: 2,
                            label: "Servidor",
                            disabled: false
                        }] : [{
                            type: 2,
                            custom_id: "avatar_user",
                            style: 1,
                            label: "Principal",
                            disabled: true
                        }]
                    }]
                })
                client.avatars.set(interaction.id, embeds)
                setTimeout(async () => {
                    embeds.length > 1 ? await interaction.editReply({
                        components: [{
                            type: 1,
                            components: [{
                                type: 2,
                                custom_id: "userAvatar",
                                style: 2,
                                label: "Principal",
                                disabled: true
                            }, {
                                type: 2,
                                custom_id: "memberAvatar",
                                style: 2,
                                label: "Servidor",
                                disabled: true
                            }]
                        }]
                    }): () => {};
                    client.avatars.delete(interaction.id)
                }, ms('30s'));
            }
            break;
            case "banner": {
                let target = options.getMember("usuario") ? options.getMember('usuario'): interaction.member
                let user = target.user;
                const userIsAuthor = () => target.user.id == interaction.user.id ? true : false;
                console.log(target)
                console.log(user)
                if (user.banner == null && user.accentColor == null) return await interaction.reply({
                    embeds: [{
                        description: models.utils.statusError('rolplayDanger', userIsAuthor() ? `Whoops... parece que no tienes un banner o un color personalizado` : `Whoops... ${user.username} no cuenta con un banner o un color personalizado`),
                        color: 0xff0000
                    }]
                })
                if (user.banner == null && user.accentColor) {
                    let image = await configs.newColorImage(user.hexAccentColor)
                    return await interaction.reply({
                        embeds: [{
                            author: {
                                name: interaction.user.username,
                                icon_url: interaction.user.avatarURL({ forceStatic: false })
                            },
                            color: user.accentColor,
                            description: userIsAuthor() ? `Parece que no cuentas con un banner, pero si con un color personalizado` : `Parece que **${user.username}** no cuenta con un banner, pero si con un color personalizado`,
                            footer: {
                                text: `color ${user.hexAccentColor}`
                            },
                            image: {
                                url: image.embedUrl
                            },
                            title: userIsAuthor() ? 'Tu color de banner': `Color de banner de ${user.username}`
                        }],
                        files: [image.attachment]
                    })
                }
                if(user.banner) return await interaction.reply({
                    embeds: [{
                        author: {
                            name: interaction.user.username,
                            icon_url: interaction.user.avatarURL({ forceStatic: false })
                        },
                        color: 0xfcf5d4,
                        description: `[Banner URL](${user.bannerURL({ forceStatic: false, size: 2048 })})`,
                        image: {
                            url: user.bannerURL({ forceStatic: false, size: 2048 })
                        },
                        title: userIsAuthor() ? 'Tu banner': `Banner de ${user.username}`
                    }]
                })
            }
            default:
                await interaction.reply("que")
            break;
        }
        
    } catch (error) {
        console.error(error)
        await configs.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    name: 'user',
    alias: ['userinfo', 'usuario'],
    id: '008',
    description: 'Muestra informacion sobre un usuario del servidor en el que estas',
    category: 'informacion',
    options: [],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks']
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}