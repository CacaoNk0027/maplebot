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

        const target = options.getSubcommand("user");
        switch (target) {
            case "info": {
                const target = options.getMember("username")
                if(target) {
                   await interaction.reply({
                        embeds: [{
                            author: {
                                name: target.user.username,
                                icon_url: target.displayAvatarURL()
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
                }
            }
            break;
            case "avatar": {
                const target = options.getMember("username")
                if (target){
                    if (target){
                        const Responde = new discord.EmbedBuilder()
                        .setColor('Random')
                        .setAuthor({ name: `Avatar de ${target.displayName}` })
                        .setImage(target.displayAvatarURL({ dynamic: true, size: 512 }))
                        .setFooter({ text: `${target.displayName}`, iconURL: `${target.displayAvatarURL({})}` })

                    interaction.reply({ embeds: [Responde], ephemeral: true })
                    } else {
                        const Responde = new discord.EmbedBuilder()
                        .setColor('Random')
                        .setAuthor({ name: `Avatar de ${member.displayName}` })
                        .setImage(user.displayAvatarURL({ dynamic: true, size: 512 }))
                        .setFooter({ text: `${member.displayName}`, iconURL: `${user.displayAvatarURL({})}` })

                    interaction.reply({ embeds: [Responde], ephemeral: true })
                    }
                }

            }
            break;
            case "banner": {
                const target = options.getMember("username")
                if (target){
                    await target.user.fetch()
                    const bannerURL = target.user.bannerURL({ format: "png", size: 4096 })
                    const embed = new EmbedBuilder()
                        .setTitle(`Banner de ${target.displayName}`)
                        .setColor('Random')
                        
                        .setFooter({ text: `${target.displayName}`, iconURL: `${target.displayAvatarURL({})}` });
                        
                        if(bannerURL){
                            embed.setImage(bannerURL)
                            interaction.reply({ embeds: [embed] });
                        } else {
                            interaction.reply({ content: `${target.displayName} no tiene banner.`, ephemeral: true });
                        }
                       
                } else {
                    await member.user.fetch()
                    const bannerURL = member.user.bannerURL({ format: "png", size: 4096 })
                    const embed = new EmbedBuilder()
                    .setTitle(`Banner de ${member.displayName}`)
                        .setColor('Random')
                        .setFooter({ text: `${member.displayName}`, iconURL: `${member.displayAvatarURL({})}` });
                        if (bannerURL) {
                            embed.setImage(bannerURL);
                            interaction.reply({ embeds: [embed] });
                        } else {
                            interaction.reply({ content: `${member.displayName} no tienes banner.`, ephemeral: true });
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
    name: 'userinfo',
    alias: ['user', 'usuario'],
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