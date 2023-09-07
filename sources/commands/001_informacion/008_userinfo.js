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
 * @param {discord.ChatInputCommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {
    try {
        const { options, user, guild, member } = interaction;

        const target = options.getSubcommand();
        switch (target) {
            case "info": {
                const target = options.getMember("username")
                if(target) {
                   await interaction.reply({
                        embeds: [{
                            author: {
                                name: target.displayName,
                                icon_url: target.displayAvatarURL()
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
                                url: target.displayAvatarURL()
                            }
                        }]
                    })
                 } else {
                    await interaction.reply({
                        embeds: [{
                            author: {
                                name: member.user.username,
                                icon_url: member.displayAvatarURL({ forceStatic: false })
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
                                url: member.displayAvatarURL({})
                            }
                        }]
                 })
                }
            }
            break;
            case "avatar": {
                const target = options.getMember("username")
                if (target){
                    if (target){
                    interaction.reply({ embeds: [{
                        author: {
                            name: ` Avatar de ${target.displayName}`,
                            icon_url: target.displayAvatarURL()
                        }, 
                        image: {
                            url: target.displayAvatarURL({ dynamic: true, size: 512})
                        },
                        footer: {
                            text: `${target.displayName}`,
                            icon_url: target.displayAvatarURL()
                        }

                    }] })
                    } else {
                        interaction.reply({ embeds: [{
                            author: {
                                name: ` Avatar de ${member.displayName}`,
                                icon_url: member.displayAvatarURL()
                            }, 
                            image: {
                                url: member.displayAvatarURL({ dynamic: true, size: 512})
                            },
                            footer: {
                                text: `${target.displayName}`,
                                icon_url: target.displayAvatarURL()
                            }
    
                        }] })
                    }
                }

            }
            break;
            case "banner": {
                const target = options.getMember("username")
                if (target){
                    await target.user.fetch()
                    const bannerURL = target.user.bannerURL({ format: "png", size: 4096 }) 
                        if(bannerURL){
                            interaction.reply({ embeds: [
                                {
                                   title: `Banner de ${target.displayName}`,
                                   url: bannerURL,
                                   image: {
                                    url: bannerURL
                                   },
                                   footer: {
                                    text: `${target.displayName}`,
                                    icon_url: `${target.displayAvatarURL({})}`
                                   }  
                                }
                            ] });
                        } else {
                            interaction.reply({ content: `${target.displayName} no tiene banner.`});
                        }
                       
                } else {
                    await member.user.fetch()
                    const bannerURL = member.user.bannerURL({ format: "png", size: 4096 }) 
                    if(bannerURL){
                        interaction.reply({ embeds: [
                            {
                               title: `Banner de ${member.displayName}`,
                               url: bannerURL,
                               image: {
                                url: bannerURL
                               },
                               footer: {
                                text: `${member.displayName}`,
                                icon_url: `${member.displayAvatarURL({})}`
                               }  
                            }
                        ] });
                    } else {
                        interaction.reply({ content: `${member.displayName} no tiene banner.`});
                    }
                }
            }
            default:
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