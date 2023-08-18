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
        if(!message.channel.permissionsFor(message.author.id).has(discord.PermissionFlagsBits.ManageChannels)) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `no cuentas con los permisos necesarios para completar esta acción...\nrequieres \`${config.permissions['ManageChannels']}\``),
                color: 0xff0000
            }]
        });
        if(args[0] == "delete") {
            if (await models.schemas.SetChannels.findOne({ guildID: message.guildId }) == null || await models.schemas.SetChannels.findOne({ guildID: message.guildId }).exec().then(m => m.suggest) == null) return await message.reply({ 
                embeds: [{
                    description: models.utils.statusError('error', "no puedes eliminar un sistema de sugerencias que nunca haz establecido"),
                    color: 0xff0000
                }] 
            })
            await models.schemas.SetChannels.updateOne({ guildID: message.guildId }, { suggest: null })
			return await message.reply({ 
                embeds: [{ 
                    description: models.utils.statusError('success', "se ha eliminado el canal preterminado para sugerencias"), 
                    color: 0x00ff00
                }] 
            })
        }
        let { channel } = await config.fetchChannel({ message: message, args: args })
        if(!channel) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `debes de mencionar un canal valido`),
                color: 0xff0000
            }]
        });
        if(channel.type !== discord.ChannelType.GuildText) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `debes de mencionar un canal de tipo texto`),
                color: 0xff0000
            }]
        });
        if(!channel.permissionsFor(client.user.id).has(discord.PermissionFlagsBits.SendMessages)) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `no puedes mencionar un canal en el que no puedo hablar`),
                color: 0xff0000
            }]
        });
        if(!await models.schemas.SetChannels.findOne({ guildID: message.guildId })) {
            await new models.schemas.SetChannels({
                guildID: message.guildId,
                suggest: channel.id,
                confession: null,
                welcome: null,
                farewell: null
            }).save();
            return await message.reply({
                embeds: [{
                    description: models.utils.statusError('success', `se ha establecido <#${channel.id}> como preterminado para sugerencias`),
                    color: 0x00ff00
                }]
            })
        }
        let confessChannel = (await models.schemas.SetChannels.findOne({ guildID: message.guildId}).exec()).suggest
        if(confessChannel == null) {
            await models.schemas.SetChannels.updateOne({guildID: message.guildId}, { suggest: channel.id })
            return await message.reply({
                embeds: [{
                    description: models.utils.statusError('success', `se ha establecido <#${channel.id}> como preterminado para sugerencias`),
                    color: 0x00ff00
                }]
            })
        } else if(channel.id == confessChannel) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `no puedes establecer un canal previamente establecido`),
                color: 0xff0000
            }]
        }); else {
            await models.schemas.SetChannels.updateOne({guildID: message.guildId}, { suggest: channel.id })
            return await message.reply({
                embeds: [{
                    description: models.utils.statusError('success', `se ha establecido <#${channel.id}> como preterminado para sugerencias`),
                    color: 0x00ff00
                }]
            })
        }
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
    name: 'setsuggest',
    alias: ['setsuggestions', 'sugerencias'],
    id: '049',
    description: 'establece un sistema de sugerencias',
    category: 'configuracion',
    options: [{
        name: "canal | eliminar",
        required: true
    }],
    permissions: {
        user: ['ManageChannels'],
        bot: ['SendMessages', 'EmbedLinks', 'ManageChannels'],
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s')/1000)
}