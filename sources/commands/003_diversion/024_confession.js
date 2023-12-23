const discord = require('discord.js')

const config = require('../../utils/exports')
const ms = require('ms');

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        if (!message.channel.permissionsFor(client.user.id).has('ManageMessages')) return await message.reply({
            embeds: [{
                description: config.statusError('warn', `Recomiendo tener permisos de \`${config.permissions['ManageMessages']}\` ya que estamos tratando confesiones`), color: 0xffff00
            }]
        });
        await message.delete().catch(err => err)
        if (await config.schemas.SetChannels.findOne({ guildID: message.guildId }) == null) return await message.channel.send({
            embeds: [{
                description: config.statusError('error', 'No hay confesiones en el servidor'), color: 0xff0000
            }]
        });
        let confessionChannel = await config.schemas.SetChannels.findOne({ guildID: message.guildId }).exec().then(c => c.confession);
        if (confessionChannel == null) return await message.channel.send({
            embeds: [{
                description: config.statusError('error', 'No hay confesiones en el servidor'), color: 0xff0000
            }]
        }); else if (!client.channels.cache.has(confessionChannel)) return await message.channel.send({
            embeds: [{
                description: config.statusError('rolplayMe', 'hay confesiones en el servidor pero no logro obtener el canal establecido'), color: 0xff0000
            }]
        }); else if (!args.join(' ') || args.join(' ').length <= 0) return await message.channel.send({
            embeds: [{
                description: config.statusError('error', 'debes escribir una confesión'), color: 0xff0000
            }]
        }); else {
            let embeds = [{
                description: args.join(' '),
                color: 0xfcf5d4,
                footer: {
                    text: `Confesión anonima`,
                    icon_url: config.defaultAvatar
                }
            }, {
                description: args.join(' ').replace(/-M|-m/g, ""),
                color: 0xfcf5d4,
                footer: {
                    text: `de: ${message.author.username}`,
                    icon_url: message.author.avatarURL({ forceStatic: false })
                }
            }]
            let channel = client.channels.cache.find(channel => channel.id == confessionChannel);
            args.join(' ').toLowerCase().endsWith('-m') ? await channel.send({ embeds: [embeds[1]] }).then(async () => {
                let msg = await message.channel.send({
                    embeds: [{
                        description: config.statusError('success', 'confesión enviada'), color: 0x00ff00
                    }]
                }); setTimeout(async () => await msg.delete().catch(err => err), ms('5s'))
            }) : await channel.send({ embeds: [embeds[0]] }).then(async () => {
                let msg = await message.channel.send({
                    embeds: [{
                        description: config.statusError('success', 'confesión enviada'), color: 0x00ff00
                    }]
                }); setTimeout(async () => await msg.delete().catch(err => err), ms('5s'))
            })
        }
    } catch (error) {
        await config.error(message, error)
    }
}

/**
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {

}

exports.help = {
    name: "confession",
    alias: ['confesion', 'confess'],
    id: "024",
    description: "envia una confesion a un canal previamente establecido",
    category: "diversion",
    options: [{
        name: "texto",
        required: true
    }, {
        name: "-m",
        required: false
    }],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks', 'ManageMessages']
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3ms') / 1000)
}