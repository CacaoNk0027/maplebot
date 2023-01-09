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
        
    } catch (error) {
        console.error(error)
        await configs.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    name: 'userinfo',
    alias: ['user', 'usuario'],
    id: '021',
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