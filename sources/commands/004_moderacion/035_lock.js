const discord = require('discord.js')

const config = require('../../utils/exports')
const ms = require('ms')


/**
 * @param {discord.Client} client
 * @param {discord.Message} message
 * @param {import('../../../typings'),args} args
 */
exports.text = async (client, message, args) => {
    try {
        if(!message.channel.permissionsFor(client.user.id).has(discord.PermissionFlagsBits.ManageChannels)) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no cuento con los permisos necesarios para completar esta acción...\nrequiero \`${config.permissions['ManageChannels']}\``),
                color: 0xff0000
            }]
        });
        if(!message.channel.permissionsFor(message.author.id).has(discord.PermissionFlagsBits.ManageChannels)) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no cuentas con los permisos necesarios para completar esta acción...\nrequieres \`${config.permissions['ManageChannels']}\``),
                color: 0xff0000
            }]
        });
        let { channel } = await config.fetchChannel({ message: message, args: args })
        if(channel.type !== discord.ChannelType.GuildText) return await message.reply({
            embeds: [{
                description: config.statusError('error', `este comando solo aplica para canales de texto`),
                color: 0xff0000
            }]
        })
        if(!channel.permissionsFor(message.guild.roles.everyone).has(discord.PermissionFlagsBits.SendMessages)) return await message.reply({
            embeds: [{
                description: config.statusError('error', `parece que el canal <#${channel.id}> ya esta bloqueado`),
                color: 0xff0000
            }]
        })
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            SendMessages: false
        }).then(async ch => {
            await message.reply({
                embeds: [{
                    description: config.statusError('success', `El canal <#${channel.id}> ha sido bloqueado correctamente`),
                    color: 0x00ff00
                }]
            })
        }).catch(err => err)
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
    name: 'lock',
    alias: ['bloqchan', 'bloquear'],
    id: '035',
    description: 'bloquea un canal para que no se pueda escribir',
    category: 'moderacion',
    options: [{
        name: "canal",
        required: true
    }],
    permissions: {
        user: ['ManageChannels'],
        bot: ['SendMessages', 'EmbedLinks', "ManageChannels"],
    },
    status: {
        code: 0,
        reason: "comando preseta fallos, sin reparar"
    },
    isNsfw: false,
    cooldown: (ms('3s')/1000)
}