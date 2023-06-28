const discord = require('discord.js')
const models = require('maplebot_models')
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
                description: models.utils.statusError('error', `no cuento con los permisos necesarios para completar esta acción...\nrequiero \`${config.permissions['ManageChannels']}\``),
                color: 0xff0000
            }]
        });
        if(!message.channel.permissionsFor(message.author.id).has(discord.PermissionFlagsBits.ManageChannels)) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `no cuentas con los permisos necesarios para completar esta acción...\nrequieres \`${config.permissions['ManageChannels']}\``),
                color: 0xff0000
            }]
        });
        let { channel } = await config.fetchChannel({ message: message, args: args })
        if(channel.type !== discord.ChannelType.GuildText) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `este comando solo aplica para canales de texto`),
                color: 0xff0000
            }]
        })
        if(channel.permissionsFor(message.guild.roles.everyone).has(discord.PermissionFlagsBits.SendMessages)) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `parece que el canal <#${channel.id}> ya esta desbloqueado`),
                color: 0xff0000
            }]
        })
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            SendMessages: true
        }).then(async ch => {
            await message.reply({
                embeds: [{
                    description: models.utils.statusError('success', `El canal <#${channel.id}> ha sido desbloqueado correctamente`),
                    color: 0x00ff00
                }]
            })
        }).catch(err => err)
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
    name: 'unlock',
    alias: ['unbloqchan', 'desbloquear'],
    id: '042',
    description: 'desbloquea un canal para que se pueda escribir',
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
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s')/1000)
}