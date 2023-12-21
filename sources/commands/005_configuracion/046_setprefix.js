const discord = require('discord.js')
const config = require('../../utils/exports');
const models = require('maplebot_models')
const ms = require('ms')

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    if (!message.member.permissions.has(discord.PermissionFlagsBits.ManageGuild)) return await message.reply({
        embeds: [{
            description: models.utils.statusError('error', `Te falta el permiso de Gestionar Servidor para ejecutar este comando`),
            color: 0xff0000
        }]
    })
    if (!args[0]) return await message.reply({
        embeds: [{
            description: models.utils.statusError('error', `Debes de escribir un nuevo prefix para la bot`),
            color: 0xff0000
        }]
    })
    if (args[0].match(require('emoji-regex')()) || args[0].match(/<a:.+?:\d+>|<:.+?:\d+>/g)) return await message.reply({
        embeds: [{
            description: models.utils.statusError('error', `no puedes poner emojis como prefix`),
            color: 0xff0000
        }]
    })
    if (args[0].length > 8) return await message.reply({
        embeds: [{
            description: models.utils.statusError('error', `el limite de caracteres para el prefix es de 8`),
            color: 0xff0000
        }]
    })
    if(await config.schemas.SetPrefix.findOne({ guildID: message.guildId }) == null) {
        if(['m!', 'maple', '<@!821452429409124451>', '<@821452429409124451>'].includes(args[0].toLowerCase())) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `no puedes cambiar el prefix al preterminado salvo que tengas un prefix personalizado`),
                color: 0xff0000
            }]
        });
        let PrefixDB = new config.schemas.SetPrefix({
            guildID: message.guildId,
            prefix: args[0].toLowerCase()
        });
        await PrefixDB.save();
        await message.reply({
            embeds: [{
                description: models.utils.statusError('success', `el prefix se ha cambiado correctamente a **${args[0].toLowerCase()}**`),
                color: 0x00ff00
            }]
        })
    } else {
        if(['m!', 'maple', '<@!821452429409124451>', '<@821452429409124451>'].includes(args[0].toLowerCase())) {
            await config.schemas.SetPrefix.deleteOne({ guildID: message.guildId });
            await message.reply({
                embeds: [{
                    description: models.utils.statusError('success', `el prefix se ha cambiado al preterminado`),
                    color: 0x00ff00
                }]
            })
        } else {
            await config.schemas.SetPrefix.updateOne({ guildID: message.guildId }, { prefix: args[0].toLowerCase() });
            await message.reply({
                embeds: [{
                    description: models.utils.statusError('success', `el prefix se ha cambiado correctamente a **${args[0].toLowerCase()}**`),
                    color: 0x00ff00
                }]
            })
        }
    }
}

/**
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {

}

exports.help = {
    name: "setprefix",
    alias: ["stprfx", "newprefix"],
    id: "046",
    description: "comando para establecer un nuevo prefix a la bot",
    category: "configuracion",
    options: [],
    permissions: {
        user: ["ManageGuild"],
        bot: ["EmbedLinks", "SendMessages"]
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}