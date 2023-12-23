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
        if (!message.channel.permissionsFor(client.user.id).has('ManageRoles')) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no cuento con los permisos necesarios para completar esta acción..\nrequiero \`${permissions['ManageRoles']}\``),
                color: 0xff0000
            }]
        });
        if (!message.member.permissionsIn(message.channelId).has('ManageRoles')) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no cuentas con los permisos necesarios para completar esta acción..\nrequieres de \`${permissions['ManageRoles']}\``),
                color: 0xff0000
            }]
        });
        if (!args[0]) return await message.reply({
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
                description: config.statusError('error', `yo no puedo quitarme roles, menciona a un usuario`),
                color: 0xff0000
            }]
        });
        if (memberIsAuthor()) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no puedes quitarte roles a ti mismo conmigo`),
                color: 0xff0000
            }]
        });
        if (member.user.id == message.guild.ownerId) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no puedes quitar roles al owner del servidor`),
                color: 0xff0000
            }]
        });
        let rol = await config.fetchRole({ message: message, args: args.slice(1) });
        if (!rol) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no se ha podido reconocer el rol mencionado`),
                color: 0xff0000
            }]
        });
        if (rol.name == "@everyone" || rol.name == "@here") return await message.reply({
            embeds: [{
                description: config.statusError('error', `los roles everyone y here no son validos aqui`),
                color: 0xff0000
            }]
        });
        let { member: clientMemb } = (await config.fetchMember({ id: client.user.id, message: message }))
        if (!rol.editable || clientMemb.roles.highest.comparePositionTo(rol) <= 0) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no puedo acceder a ese rol, por lo cual no puedo quitarlo`),
                color: 0xff000
            }]
        });
        if (message.member.roles.highest.comparePositionTo(rol) <= 0) return await message.reply({
            embeds: [{
                description: config.statusError('error', `el rol mencionado es de mayor o de igual jerarquia que el tuyo`),
                color: 0xff0000
            }]
        });
        if (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return await message.reply({
            embeds: [{
                description: config.statusError('error', `el usuario mencionado tiene un rol de mayor o igual jerarquia que el tuyo`),
                color: 0xff0000
            }]
        });
        if (!member.roles.cache.has(rol.id)) return await message.reply({
            embeds: [{
                description: config.statusError('error', `el usuario mencionado no cuenta con el rol mencionado`),
                color: 0xff0000
            }]
        });
        await member.roles.remove(rol.id).catch(error => error);
        await message.reply({
            embeds: [{
                description: config.statusError('success', `Los roles de **${member.user.username}** fueron actualizados correctamente`),
                color: 0x00ff00,
                fields: [{
                    name: "Rol removido",
                    value: `#1 - <@&${rol.id}>`
                }],
                footer: {
                    text: `Moderador: ${message.author.username}`,
                    icon_url: message.author.avatarURL({ forceStatic: false })
                }
            }]
        })

    } catch (err) {
        console.error(err)
        await config.error(message, err)
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
    name: 'removerol',
    alias: [],
    id: '037',
    description: 'remueve un rol a un usuario',
    category: 'moderacion',
    options: [{
        name: "usuario",
        required: true
    }, {
        name: "rol",
        required: true
    }],
    permissions: {
        user: ["ManageRoles"],
        bot: ['SendMessages', 'EmbedLinks', "ManageRoles"],
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}