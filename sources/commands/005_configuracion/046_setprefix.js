const discord = require('discord.js')
const configs = require('../../utils/exports');
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
    if(await models.schemas.SetPrefix.findOne({ guildID: message.guildId }) == null) {
        if(['m!', 'maple', '<@!821452429409124451>', '<@821452429409124451>'].includes(args[0].toLowerCase())) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `no puedes cambiar el prefix al preterminado salvo que tengas un prefix personalizado`),
                color: 0xff0000
            }]
        });
        let PrefixDB = new models.schemas.SetPrefix({
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
            await models.schemas.SetPrefix.deleteOne({ guildID: message.guildId });
            await message.reply({
                embeds: [{
                    description: models.utils.statusError('success', `el prefix se ha cambiado al preterminado`),
                    color: 0x00ff00
                }]
            })
        } else {
            await models.schemas.SetPrefix.updateOne({ guildID: message.guildId }, { prefix: args[0].toLowerCase() });
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
 * @param {discord.ChatInputCommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {
    const guildId = interaction.guild.id;
    const newPrefix = interaction.options.getString('prefijo');
  
    // Verificar permisos del usuario
    if (!interaction.member.permissions.has(discord.PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: "No tienes permisos para cambiar el prefijo.",
        ephemeral: true // Hace que el mensaje sea visible solo para el usuario que ejecutó el comando
      });
    }
  
    // Validar el nuevo prefijo
    if (newPrefix.match(require('emoji-regex')()) || newPrefix.match(/<a:.+?:\d+>|<:.+?:\d+>/g)) {
      return interaction.reply({
        content: "No puedes usar emojis como prefijo.",
        ephemeral: true
      });
    }
    if (newPrefix.length > 8) {
      return interaction.reply({
        content: "El límite de caracteres para el prefijo es de 8.",
        ephemeral: true
      });
    }
  
    // Actualizar el prefijo en la base de datos
    try {
      let PrefixDB = await models.schemas.SetPrefix.findOne({ guildID: guildId });
      if (!PrefixDB) {
        PrefixDB = new models.schemas.SetPrefix({
          guildID: guildId,
          prefix: newPrefix.toLowerCase()
        });
      } else {
        PrefixDB.prefix = newPrefix.toLowerCase();
      }
      await PrefixDB.save();
      
      return interaction.reply({
        content: `El prefijo se ha cambiado correctamente a **${newPrefix.toLowerCase()}**.`,
        ephemeral: true
      });
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "Hubo un error al cambiar el prefijo.",
        ephemeral: true
      });
    }
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