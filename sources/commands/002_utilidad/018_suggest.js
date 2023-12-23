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
        if(await config.schemas.SetChannels.findOne({ guildID: message.guildId }) == null) return await message.reply({
            embeds: [{ description: config.statusError('error', 'al parecer no hay sugerencias en este servidor'), color: 0xff0000 }]
        });
        let suggestChannel = await config.schemas.SetChannels.findOne({ guildID: message.guildId }).exec().then(obj => obj.suggest)
        if(suggestChannel == null) return await message.reply({
            embeds: [{ description: config.statusError('error', 'al parecer no hay sugerencias en este servidor'), color: 0xff0000 }]
        }); else if(!client.channels.cache.has(suggestChannel)) return await message.reply({
            embeds: [{ description: config.statusError('error', 'hay un sistema de sugerencias establecido, pero no puedo encontrar el canal establecido'), color: 0xff0000 }]
        }); else if(!args.join(' ')) return await message.reply({
            embeds: [{ description: config.statusError('error', 'debes escribir una sugerencia'), color: 0xff0000 }]
        }); else if(!args.join(' ').length > 1000) return await message.reply({
            embeds: [{ description: config.statusError('error', 'las sugerencias solo aceptan 1000 caracteres como maximo'), color: 0xff0000 }]
        }); else {
            await message.delete().catch(err => err)
            await message.channel.send({
                embeds: [{
                    author: {
                        name: message.author.username,
                        icon_url: message.author.avatarURL({ forceStatic: false })
                    },
                    color: 0x00ff00,
                    description: config.statusError('success', 'tu sugerencia ha sido enviada correctamente')
                }]
            });
            await client.channels.cache.find(channel => channel.id == suggestChannel).send({
                embeds: [new discord.EmbedBuilder({
                    author: {
                        name: message.author.username,
                        icon_url: message.author.avatarURL({ forceStatic: false })
                    },
                    color: 0x91ffff,
                    description: args.join(' '),
                    fields: [{
                        name: 'Estado',
                        value: 'pendiente'
                    }],
                    footer: {
                        text: `Code: cGVuZGllbnRl`
                    },
                    title: `Nueva sugerencia`
                })]
            }).then(async msg => {
                await msg.react("🔼");
                await msg.react("🔽");
            });
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
    name: 'suggestion',
    alias: ['suggest', 'sugerencia', 'sug'],
    id: '018',
    description: 'envia una sugerencia a un canal previamente configurado para sugerencias',
    category: 'utilidad',
    options: [],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks', 'AddReactions']
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}