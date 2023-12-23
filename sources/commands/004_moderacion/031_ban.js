const discord = require('discord.js')

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
                description: config.statusError('error', `no cuento con los permisos necesarios para completar esta acción..\nrequiero \`${permissions['BanMembers']}\``),
                color: 0xff0000
            }]
        }); else if(!message.channel.permissionsFor(message.author.id).has('BanMembers')) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no cuentas con los permisos necesarios para completar esta accion..\nrequieres \`${permissions['BanMembers']}\``),
                color: 0xff0000
            }]
        }); else if(!args[0]) return await message.reply({
            embeds: [{
                description: config.statusError('error', `el parametro <usuario> es requerido`),
                color: 0xff0000
            }]
        }); 
        let { member, memberIsAuthor } = await config.fetchMember({ message: message, args: args });
        if (!member) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no se ha podido encontrar al miembro mencionado`),
                color: 0xff0000
            }]
        });
        if(member.user.id == client.user.id) return await message.reply({
            embeds: [{
                description: config.statusError('rolplayDanger', `pero.. por que me quieres banear? he hecho algo malo? dicelo a mi creador!`),
                color: 0xff0000
            }]
        }); else if (memberIsAuthor()) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no puedes banearte a ti mismo`),
                color: 0xff0000
            }]
        }); else if(member.id == message.guild.ownerId) return await message.reply({
            embeds: [{
                description: config.statusError('error', `No puedes banear al owner del servidor`),
                color: 0xff0000
            }]
        }); else if((await message.guild.members.fetchMe()).roles.highest.comparePositionTo(member.roles.highest) <= 0) return await message.reply({
            embeds: [{
                description: config.statusError('error', `El usuario que haz mencionado tiene roles de mayor o igual jerarquia al mio`),
                color: 0xff0000
            }]
        }); else if(message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return await message.reply({
            embeds: [{
                description: config.statusError('error', `El usuario que haz mencionado tiene roles de mayor o igual jerarquia a los tuyos`),
                color: 0xff0000
            }]
        }); else if((await message.guild.bans.fetch()).has(member.user.id)) return await message.reply({
            embeds: [{
                description: config.statusError('error', `El usuario que haz mencionado ya esta baneado del servidor`),
                color: 0xff0000
            }]
        }); else {
            let reason = args.slice(1).join(' ');
            if(reason.length <= 0) reason = `${message.author.username}: sin razon especificada`; else if(reason.length > 300) return await message.reply({
                embeds: [{
                    description: config.statusError('error', `la razon del baneo no puede superar los 300 caracteres`),
                    color: 0xff0000
                }]
            }); else reason = `${message.author.username}: ${reason}`;
            await message.guild.members.ban(member.user.id, { reason: reason }).catch(async err => await config.error(message, err))
            await message.delete().catch(err => err);
            return await message.reply({
                embeds: [{
                    description: config.statusError('success', `el usuario **${member.user.username}** fue baneado de **${message.guild.name}**`),
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
        await config.error(message, error)
    }
}

exports.slash = async (client, interaction) => {
    try {

    } catch (error) {
        await config.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    name: 'ban',
    alias: ['baneo'],
    id: '031',
    description: 'banea a un usuario',
    category: 'moderacion',
    options: [{
        name: "usuario",
        required: true
    }, {
        name: "razon",
        required: true
    }],
    permissions: {
        user: ['BanMembers'],
        bot: ['SendMessages', 'EmbedLinks', 'ManageMessages', 'BanMembers']
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}