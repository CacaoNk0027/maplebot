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
        if(!message.channel.permissionsFor(message.author.id).has('ManageMessages')) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `no cuentas con los permisos necesarios para hacer esta acción..\nnecesitas \`${permissions['ManageMessages']}\` para usar este comando`),
                color: 0xff0000
            }]
        }); else if (!await models.schemas.SetChannels.findOne({ guildID: message.guildId })) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', "el servidor no cuenta con un sistema de sugerencias previamente establecido"),
                color: 0xff0000
            }]
        }); else if (!await models.schemas.SetChannels.findOne({ guildID: message.guildId }).exec().then(obj => obj.suggest)) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', "el servidor no cuenta con un sistema de sugerencias previamente establecido"),
                color: 0xff0000
            }]
        });
        let channel; try {
            channel = (await client.channels.fetch((
                await models.schemas.SetChannels.findOne({ guildID: message.guildId }).exec().then(obj => obj.suggest)
            )))
        } catch (error) {
            return await message.reply({
                embeds: [{
                    description: models.utils.statusError('error', "hay un sistema de sugerencias establecido pero no puedo obtener el canal que se establecio"),
                    color: 0xff0000
                }]
            })
        }; if(!channel.permissionsFor(client.user.id).has('ReadMessageHistory')) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `necesito el permiso de \`${permissions['ReadMessageHistory']}\` para poder ver las sugerencias`),
                color: 0xff0000
            }]
        }); else if (!args[0]) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', "el parametro <mensajeId> debe de ser completado"),
                color: 0xff0000
            }]
        }); else if (!args[0].match(/\d{19}/)) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', "el parametro <mensajeId> no corresponde a lo solicitado"),
                color: 0xff0000
            }]
        });
        let suggestion_; try {
            suggestion_ = (await channel.messages.fetch(args[0].match(/\d{19}/)[0]))
        } catch (error) {
            console.error(error)
            return await message.reply({
                embeds: [{
                    description: models.utils.statusError('error', 'el parametro <mensajeId> no corresponde a la id de un mensaje o el mensaje no se pudo obtener'),
                    color: 0xff0000
                }]
            })
        }
        if (suggestion_.author.id !== client.user.id || suggestion_.embeds.length <= 0 || suggestion_.embeds[0].title == null || suggestion_.embeds[0].title.toLowerCase() !== "nueva sugerencia") return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', "el parametro <mensajeId> ha recibido un mensaje de otro usuario o no es un mensaje de sugerencia"),
                color: 0xff0000
            }]
        }); else {
            let embed = suggestion_.embeds[0], status = embed.fields.find(c => c.name == "Estado").value;
            if (embed.footer.text !== "Code: cmVzcG9uZGlkbw==") {
                let reason = args.slice(1).join(' ');
                if (!reason) reason = "Sin razón"; else if (reason.length > 300) return await message.reply({
                    embeds: [{
                        description: models.utils.statusError('error', "las razones no pueden superar los 300 caracteres"),
                        color: 0xff0000
                    }]
                });
                await suggestion_.reactions.removeAll().catch(err => err);
                await message.delete().catch(err => err);
                await message.channel.send({
                    embeds: [{
                        author: {
                            name: message.author.username,
                            icon_url: message.author.avatarURL({ forceStatic: false })
                        },
                        color: 0x00ff00,
                        description: models.utils.statusError('success', `La sugerencia se ha aceptado con la siguente razon\n> ${reason}\n`)
                    }]
                })
                return await suggestion_.edit({
                    embeds: [ new discord.EmbedBuilder(embed.data)
                        .setColor(0x00ff00)
                        .setFields([{
                            name: 'Estado',
                            value: 'Aceptada'
                        }, {
                            name: "Razón",
                            value: reason
                        }]).setFooter({
                            text: `Code: cmVzcG9uZGlkbw==`
                        })
                    ]
                })
            } else {
                if (status == "Aceptada") return await message.reply({
                    embeds: [{
                        description: models.utils.statusError('error', "esa sugerencia ya ha sido respondida y fue aceptada"),
                        color: 0xff0000
                    }]
                }); else if (status == "Declinada") return await message.reply({
                    embeds: [{
                        description: models.utils.statusError('error', "esa sugerencia ya ha sido respondida y fue declinada"),
                        color: 0xff0000
                    }]
                })
            }
        }
    } catch (error) {
        console.error(error)
        await models.utils.error(message, error)
    }
}

exports.slash = async (client, interaction) => {
    try {
        
    } catch (error) {
        await config.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    name: 'accept',
    alias: ['acceptsug'],
    id: '029',
    description: 'acepta una sugerencia del servidor',
    category: 'moderacion',
    options: [{
        name: "mensaje id",
        required: true
    }, {
        name: "razon",
        required: false
    }],
    permissions: {
        user: ['ManageMessages'],
        bot: ['SendMessages', 'EmbedLinks', 'ReadMessageHistory', 'ManageMessages']
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}