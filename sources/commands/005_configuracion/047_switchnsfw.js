const discord = require('discord.js')
const models = require("maplebot_models")
const ms = require("ms")
const { permissions, fetchChannel } = require('../../utils/exports')

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        if (!message.channel.permissionsFor(client.user.id).has(discord.PermissionFlagsBits.ManageChannels)) return await message.reply({
            embeds: [{
                description: config.statusError('error', `Para ejecutar este comando requiero del permiso \`${permissions['ManageChannels']}\` el cual no me fue otorgado`),
                color: 0xff0000
            }]
        })
        if (!message.channel.permissionsFor(message.author.id).has(discord.PermissionFlagsBits.ManageChannels)) return await message.reply({
            embeds: [{
                description: config.statusError('error', `Para ejecutar este comando requieres del permiso \`${permissions['ManageChannels']}\``),
                color: 0xff0000
            }]
        })
        let { channel } = await fetchChannel({ args: args, message: message });
        if (channel.type != discord.ChannelType.GuildText) return await message.reply({
            embeds: [{
                description: config.statusError('error', `Para ejecutar este comando se requiere que el canal sea de texto`),
                color: 0xff0000
            }]
        })
        if(!channel.nsfw) {
            await channel.setNSFW(true);
            return await message.reply({
                embeds: [{
                    description: `\`\`\`\nSe ha activado el NSFW en el canal ${channel.name}\n\`\`\``,
                    color: 0xff0000
                }]
            })
        } else {
            await channel.setNSFW(false);
            return await message.reply({
                embeds: [{
                    description: `\`\`\`\nSe ha desactivado el NSFW en el canal ${channel.name}\n\`\`\``,
                    color: 0x00ff00
                }]
            })
        }
    } catch (error) {
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
    name: 'switchnsfw',
    alias: ['setnsfw'],
    id: '047',
    description: 'Activa o desactiva el NSFW de un canal',
    category: 'configuracion',
    options: [{
        name: 'channel',
        required: false
    }],
    permissions: {
        user: ['ManageChannels'],
        bot: ['SendMessages', 'EmbedLinks', 'ManageChannels']
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}