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
        if(!message.channel.permissionsFor(client.user.id).has('BanMembers')) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `no cuento con los permisos necesarios para completar esta acción..\nrequiero \`${config.permissions['BanMembers']}\``),
                color: 0xff0000
            }]
        }); 
        if(!message.channel.permissionsFor(message.author.id).has('BanMembers')) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `no cuentas con los permisos necesarios para completar esta accion..\nrequieres \`${config.permissions['BanMembers']}\``),
                color: 0xff0000
            }]
        });
        if(!args[0]) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `debes poner ia id de un usuario`) + `\nescribe el comando banlist para ver una lista de usuarios baneados`,
                color: 0xf5ad87
            }]
        })
        let member = (await message.guild.bans.fetch()).find(memb => memb.user.id == args[0].match(/\d{18}|\d{19}/g)[0]);
        if(!member) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', "el usuario no se encuentra en la lista de baneos o la id no corresponde a un usuario"),
                color: 0xff0000
            }]
        });
        if(member.user.id == client.user.id) return await message.reply({
            embeds: [{
                description: models.utils.statusError('rolplayMe', "no hay necesidad de ponerme a mi, yo no estoy baneada"),
                color: 0xff0000
            }]
        });
        if(member.user.id == message.author.id || member.user.id == message.guild.ownerId) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', "enserio?"),
                color: 0xff0000
            }]
        });
        let reason = args.slice(1).join(" ");
        reason.length <= 0 ? reason = "sin razon especificada": reason
        await message.guild.bans.remove(member.client.user.id, reason).then(async () => {
            await message.reply({
                embeds: [{
                    description: models.utils.statusError('success', `se removio el baneo a **${member_.user.username}**`),
                    fields: [{
                        name: "Razón",
                        value: reason
                    }],
                    footer: {
                        text: `Moderador: ${message.author.username}`,
                        icon_url: message.author.avatarURL({ forceStatic: false })
                    }
                }]
            })
        }).catch(error => error)
    } catch (err) {
        console.error(err)
        await models.utils.error(message, err)
    }
}


/**
 * @param {discord.Client} client
 * @param {discord.CommandInteraction} interaction
 */
exports.slash = async (client, interaction) => {
    try {
        
    } catch (err) {
        console.error(err)
        await config.interactionErrorMsg(interaction, err)
    }
}


exports.help = {
    name: 'unban',
    alias: ['desbaneo','desbanear','desban'],
    id: '040',
    description: 'desbanea a un usuario del servidor',
    category: 'moderacion',
    options: [{
        name: "id",
        required: true
    }, {
        name: "razon",
        required: false
    }],
    permissions: {
        user: ['BanMembers'],
        bot: ['SendMessages', 'EmbedLinks', 'BanMembers'],
    },
    status: {
        code: 0,
        reason: "comando preseta fallos, sin reparar"
    },
    isNsfw: false,
    cooldown: (ms('3s')/1000)
}