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
        if (!message.channel.permissionsFor(client.user.id).has('ManageRoles')) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no cuento con los permisos necesarios para completar esta acción..\nrequiero \`${permissions['ManageRoles']}\``),
                color: 0xff0000
            }]
        }); else if (!message.member.permissionsIn(message.channelId).has('ManageRoles')) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no cuentas con los permisos necesarios para completar esta acción..\nrequieres de \`${permissions['ManageRoles']}\``),
                color: 0xff0000
            }]
        }); else if (!args[0]) return await message.reply({
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
        if (member.user.id == client.user.id) return await message.reply({
            embeds: [{
                description: config.statusError('error', `No puedo añadirme roles asi yo sola`),
                color: 0xff0000
            }]
        }); else if (memberIsAuthor()) return await message.reply({
            embeds: [{
                description: config.statusError('error', `No puedes añadirte roles a ti mismo`),
                color: 0xff0000
            }]
        }); else if (member.id == message.guild.ownerId) return await message.reply({
            embeds: [{
                description: config.statusError('error', `No puedes añadir roles al owner del servidor`),
                color: 0xff0000
            }]
        }); else if (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return await message.reply({
            embeds: [{
                description: config.statusError('error', `El usuario que haz mencionado tiene roles de mayor o igual jerarquia a los tuyos`),
                color: 0xff0000
            }]
        }); else if (!args[1]) return await message.reply({
            embeds: [{
                description: config.statusError('error', `el parametro <rol> es requerido`),
                color: 0xff0000
            }]
        });
        const _no_role = async () => {
            return await message.reply({
                embeds: [{
                    description: config.statusError('error', `el parametro <rol> no corresponde a lo solicitado o no se puede encontrar el rol mencionado`),
                    color: 0xff0000
                }]
            })
        }
        let role_; try {
            let role_collection_ = (await message.guild.roles.fetch())
            role_ = role_collection_.find(c => c.id == args[1].match(/\d{18}/g)[0]) || role_collection_.find(c => c.name.toLowerCase() == args[1].toLowerCase())
        } catch (error) {
            return await _no_role();
        }
        if (!role_ || role_ == null || role_ == undefined) return await _no_role(); else if (role_.name == "@everyone" || role_.name == "@here") return await message.reply({
            embeds: [{
                description: config.statusError('error', `los roles de everyone no son validos, son roles con los que ya cuenta el usuario por default`),
                color: 0xff0000
            }]
        }); else if (!role_.editable || role_.editable == false || (await message.guild.members.fetchMe()).roles.highest.comparePositionTo(role_.id) <= 0) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no puedo acceder a el rol mencionado, es de mayor jerarquia al mio`),
                color: 0xff0000
            }]
        }); else if (message.member.roles.highest.comparePositionTo(role_.id) <= 0) return await message.reply({
            embeds: [{
                description: config.statusError('error', `por seguridad no puedo poner roles mas altos o iguales a tu jerarquia`),
                color: 0xff0000
            }]
        }); else {
            if (member.roles.cache.has(role_.id)) return await message.reply({
                embeds: [{
                    description: config.statusError('error', `el usuario ya cuenta con el rol mencionado`),
                    color: 0xff0000
                }]
            }); else {
                await member.roles.add(role_.id).catch(async err => await config.error(message, err))
                return await message.reply({
                    embeds: [{
                        description: config.statusError('success', `Los roles de **${member.user.username}** fueron actualizados correctamente`),
                        color: 0x00ff00,
                        fields: [{
                            name: "Rol añadido",
                            value: `#1 - <@&${role_.id}>`
                        }],
                        footer: {
                            text: `Moderador: ${message.author.username}`,
                            icon_url: message.author.avatarURL({ forceStatic: false })
                        }
                    }]
                })
            }
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
    name: 'addrol',
    alias: ['añadirrol'],
    id: '030',
    description: 'añade un rol a un usuario',
    category: 'moderacion',
    options: [{
        name: "usuario",
        required: true
    }, {
        name: "rol",
        required: true
    }],
    permissions: {
        user: ['ManageRoles'],
        bot: ['SendMessages', 'EmbedLinks', 'ReadMessageHistory', 'ManageRoles']
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}