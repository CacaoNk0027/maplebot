const discord = require('discord.js')
const models = require('maplebot_models')
const config = require('../../utils/exports')
const ms = require('ms')
const moment = require('moment')
const format = require('moment-duration-format')
format(moment)

/**
 * @param {discord.Client} client
 * @param {discord.Message} message
 * @param {import('../../../typings').args} args
 */
exports.text = async (client, message, args) => {
    try {
        if (!message.channel.permissionsFor(client.user.id).has(discord.PermissionFlagsBits.ModerateMembers)) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no cuento con los permisos necesarios para completar esta acción...\nrequiero \`${config.permissions['ModerateMembers']}\``),
                color: 0xff0000
            }]
        });
        if (!message.channel.permissionsFor(message.author.id).has(discord.PermissionFlagsBits.ModerateMembers)) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no cuentas con los permisos necesarios para completar esta acción...\nrequieres \`${config.permissions['ModerateMembers']}\``),
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
                description: config.statusError('error', `no he podido encontrar al usuario mencionado`),
                color: 0xff0000
            }]
        });
        if (member.user.id == client.user.id) return await message.reply({
            embeds: [{
                description: config.statusError('rolplayDanger', `hay algun motivo por el cual quieras aislarme? dicelo a mi creador!`),
                color: 0xff0000
            }]
        });
        if (memberIsAuthor()) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no puedes aislarte a ti mismo`),
                color: 0xff0000
            }]
        });
        if (member.user.id == message.guild.ownerId) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no puedes aislar al owner del servidor`),
                color: 0xff0000
            }]
        });
        let { member: clientMemb } = (await config.fetchMember({ id: client.user.id, message: message }))
        if (clientMemb.roles.highest.comparePositionTo(member.roles.highest) <= 0) return await message.reply({
            embeds: [{
                description: config.statusError('error', `el usuario mencionado tiene mayor o igual jerarquia a mi rol`),
                color: 0xff0000
            }]
        });
        if (message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return await message.reply({
            embeds: [{
                description: config.statusError('error', `el usuario mencionado tiene mayor o igual jerarquia a tu rol`),
                color: 0xff0000
            }]
        });
        if (!args[1]) return await message.reply({
            embeds: [{
                description: config.statusError('error', `el parametro <tiempo> es requerido`),
                color: 0xff0000
            }]
        })
        if (!args[1].match(/s|m|h|d|w/g)) return await message.reply({
            embeds: [{
                description: config.statusError('error', `Usa uno de los siguientes formatos de tiempo...`),
                color: 0xff0000,
                fields: [{
                    name: "Formatos",
                    value: `\`\`\`\ns [segundos] | m [minutos] | h [horas] | d [dias] | w [semanas]\n\`\`\``
                }]
            }]
        })
        let time = ms(args[1])
        if (!time) return await message.reply({
            embeds: [{
                description: config.statusError('error', `el tiempo marcado es invalido`),
                color: 0xff0000
            }]
        })
        if (time > 2419200000) return await message.reply({
            embeds: [{
                description: config.statusError('error', `el tiempo no puede revasar las 4 semanas`),
                color: 0xff0000
            }]
        });
        if (time < 60000) return await message.reply({
            embeds: [{
                description: config.statusError('error', `el tiempo no puede ser menor a 1 minuto`)
            }]
        });
        let reason = args.slice(2).join(' ');
        reason.length <= 0 ? reason = "sin razon especificada" : reason
        await member.timeout(time, reason).then(async () => {
            await message.reply({
                embeds: [{
                    description: config.statusError('success', `el usuario **${member.user.username}** ha sido aislado`),
                    fields: [{
                        name: "Razón",
                        value: reason
                    }, {
                        name: "Tiempo",
                        value: moment.duration(time).format(`W [Semana] D [Días], H [Horas], m [Minutos], s [Segundos]`)
                    }],
                    footer: {
                        text: `Moderador: ${message.author.username}`,
                        icon_url: message.author.avatarURL({ forceStatic: false })
                    }
                }]
            })
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
    name: 'timeout',
    alias: ['aislamiento', 'aislar'],
    id: '039',
    description: 'añade un aislamiento temporal a un usuario',
    category: 'moderacion',
    options: [{
        name: "usuario",
        required: true
    }, {
        name: "tiempo",
        required: true
    }, {
        name: "razon",
        required: false
    }],
    permissions: {
        user: ['ModerateMembers'],
        bot: ['SendMessages', 'EmbedLinks', 'ModerateMembers'],
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}