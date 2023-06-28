const discord = require('discord.js')
const models = require('maplebot_models')
const config = require('../../utils/exports')
const ms = require('ms')
const moment = require('moment');
const format = require("moment-duration-format");
format(moment)

/**
 * @param {number} time 
 */
const returnString = (time) => {
    let segundos = (time/1000)
    if(segundos<=59) {
        return moment.duration(time).format(`s [segundos]`)
    } else if(segundos>59) {
        if(segundos==60) return moment.duration(time).format(`m [minuto]`);
        else return moment.duration(time).format(`m [minutos]`)
    } else if(segundos>3540) {
        if(segundos == 3600) return moment.duration(time).format(`H [Hora]`);
        else return moment.duration(time).format(`H [horas]`)
    }
}

/**
 * @param {discord.Client} client
 * @param {discord.Message} message
 * @param {import('../../../typings').args} args
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
        if(!args[0]) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `el parametro <tiempo> es requerido`),
                color: 0xff0000
            }]
        });
        if(!args[0].match(/s|m|h/g)) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `Usa uno de los siguientes formatos de tiempo...`),
                color: 0xff0000,
                fields: [{
                    name: "Formatos",
                    value: `\`\`\`\ns [segundos] | m [minutos] | h [horas]\n\`\`\``
                }]
            }]
        })
        let time = ms(args[0]);
        if(!time) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', 'el tiempo que haz marcado es invalido'),
                color: 0xff0000
            }]
        })
        if(time > 21600000) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', 'el tiempo no puede superar las 6 horas'),
                color: 0xff0000
            }]
        })
        if(time < 0) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', 'el tiempo no puede ser menor a 0 segundos'),
                color: 0xff0000
            }]
        })
        let { channel } = await config.fetchChannel({ message: message, args: args.slice(1) })
        if(channel.type !== discord.ChannelType.GuildText) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `este comando solo aplica para canales de texto`),
                color: 0xff0000
            }]
        })
        if(time == 0) {
            if(!channel.rateLimitPerUser) return await message.reply({
                embeds: [{
                    description: models.utils.statusError('error', `el no cuenta con un cooldown`),
                    color: 0xff0000
                }]
            })
            await channel.setRateLimitPerUser(0).catch(error => error);
            await message.reply({
                embeds: [{
                    description: models.utils.statusError('success', `se ha desactivado el cooldown en el canal <#${channel.id}>`),
                    color: 0x00ff00
                }]
            })
        } else {
            if(channel.rateLimitPerUser == (time/1000)) return await message.reply({
                embeds: [{
                    description: models.utils.statusError('error', `el tiempo escrito es exactamente igual al tiempo actual`),
                    color: 0xff0000
                }]
            })
            await channel.setRateLimitPerUser((time/1000)).then(async () => {
                await message.reply({
                    embeds: [{
                        description: `${models.utils.statusError(`success`, `Se ha establecido un cooldown de **${returnString(time)}** en el canal **${channel.name}**`)}`,
                        color: 0x00ff00
                    }]
                })
            }).catch(error => error);
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
    name: 'setcooldown',
    alias: ['cooldown', 'ratelimit'],
    id: '038',
    description: 'establece un tiempo de ratelimit en el chat, para quitar el tiempo establecelo en 0s',
    category: 'moderacion',
    options: [{
        name: "tiempo",
        required: true
    }, {
        name: "canal",
        required: false
    }],
    permissions: {
        user: ["ManageChannels"],
        bot: ['SendMessages', 'EmbedLinks', "ManageChannels"],
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s')/1000)
}