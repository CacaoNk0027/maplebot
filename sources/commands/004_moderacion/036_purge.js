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
        if(!message.channel.permissionsFor(client.user.id).has(discord.PermissionFlagsBits.ManageMessages)) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no cuento con los permisos necesarios para completar esta acción...\nrequiero \`${config.permissions['ManageMessages']}\``),
                color: 0xff0000
            }]
        });
        if(!message.channel.permissionsFor(message.author.id).has(discord.PermissionFlagsBits.ManageMessages)) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no cuentas con los permisos necesarios para completar esta acción...\nrequieres \`${config.permissions['ManageMessages']}\``),
                color: 0xff0000
            }]
        });
        if(!args[0]) return await message.reply({
            embeds: [{
                description: config.statusError('error', `el parametro <numero> es requerido`),
                color: 0xff000
            }]
        });
        if(isNaN(args[0])) return await message.reply({
            embeds: [{
                description: config.statusError('error', `no puedes poner letras ni simbolos en el parametro <numero>`),
                color: 0xff0000
            }]
        });
        let num = parseInt(args[0]);
        if(num <= 0 || num > 100) return await message.reply({
            embeds: [{
                description: config.statusError('error', `la cantidad de mensajes a eliminar es invalida, por favor ingresa una cantidad correcta`),
                color: 0xff0000
            }]
        });
        await message.channel.bulkDelete(num, true).then(async (col) => {
            await message.channel.send({
                embeds: [{
                    description: config.statusError('success', `se han eliminado alrededor de ${col.size} mensajes`),
                    color: 0x00ff00
                }]
            })
        })
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
    name: 'purge',
    alias: ['prune', 'clear', 'clwcht'],
    id: '036',
    description: 'limpia un maximo de 100 mensajes en el chat',
    category: 'moderacion',
    options: [{
        name: "numero",
        requied: true,
    }],
    permissions: {
        user: ['ManageMessages'],
        bot: ['SendMessages', 'EmbedLinks', 'ManageMessages'],
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s')/1000)
}