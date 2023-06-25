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
        if(!message.channel.permissionsFor(client.user.id).has('KickMembers')) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `no cuento con los permisos necesarios para completar esta acción..\nrequiero \`${config.permissions['KickMembers']}\``),
                color: 0xff0000
            }]
        }); else if(!message.channel.permissionsFor(message.author.id).has('KickMembers')) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `no cuentas con los permisos necesarios para completar esta accion..\nrequieres \`${config.permissions['KickMembers']}\``),
                color: 0xff0000
            }]
        }); else if(!args[0]) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `el parametro <usuario> es requerido`),
                color: 0xff0000
            }]
        });
        let member_; try {
            member_ = (await message.guild.members.fetch(args[0].match(/\d{18}/g)[0]))
        } catch (error) {
            return await message.reply({
                embeds: [{
                    description: models.utils.statusError('error', `El parametro <usuario> no corresponde a lo solicitado o no se puede encontrar al usuario mencionado`),
                    color: 0xff0000
                }]
            })
        }
        if(member_.user.id == client.user.id) return await message.reply({
            embeds: [{
                description: models.utils.statusError('rolplayDanger', `pero.. por que me quieres expulsar? he hecho algo malo? dicelo a mi creador!`),
                color: 0xff0000
            }]
        }); else if(member_.user.id == message.author.id) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `No puedes expulsarte a ti mismo, si quieres irte del server solo hazlo y ya`),
                color: 0xff0000
            }]
        }); else if(member_.id == message.guild.ownerId) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `No puedes expulsar al owner del servidor`),
                color: 0xff0000
            }]
        }); else if((await message.guild.members.fetch()).has(member_.user.id)) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `El usuario que haz mencionado no se encuentra en el servidor`),
                color: 0xff0000
            }]
        }); else if((await message.guild.members.fetchMe()).roles.highest.comparePositionTo(member_.roles.highest) <= 0) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `El usuario que haz mencionado tiene roles de mayor o igual jerarquia al mio`),
                color: 0xff0000
            }]
        }); else if(message.member.roles.highest.comparePositionTo(member_.roles.highest) <= 0) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `El usuario que haz mencionado tiene roles de mayor o igual jerarquia a los tuyos`),
                color: 0xff0000
            }]
        }); else {
            let reason = args.slice(1).join(' ');
            if(reason.length <= 0) reason = `${message.author.username}: sin razon especificada`; else if(reason.length > 300) return await message.reply({
                embeds: [{
                    description: models.utils.statusError('error', `la razon de la expulsion no puede superar los 300 caracteres`),
                    color: 0xff0000
                }]
            }); else reason = `${message.author.username}: ${reason}`;
            await message.guild.members.kick(member_.user.id, reason).catch(async err => await models.utils.error(message, err))
            await message.delete().catch(err => err);
            return await message.reply({
                embeds: [{
                    description: models.utils.statusError('success', `el usuario **${member_.user.username}** fue expulsado de **${message.guild.name}**`),
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
        }
    } catch (error) {
        console.error(error)
        await models.utils.error(message, error)
    }
}

exports.slash = async (client, interaction) => {
    try {

    } catch (error) {
        await config.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    name: 'kick',
    alias: ['expulsar'],
    id: '034',
    description: 'expulsa a un usuario',
    category: 'moderacion',
    options: [{
        name: "usuario",
        required: true
    }, {
        name: "razon",
        required: true
    }],
    permissions: {
        user: ['KickMembers'],
        bot: ['SendMessages', 'EmbedLinks', 'ManageMessages', 'KickMembers']
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}