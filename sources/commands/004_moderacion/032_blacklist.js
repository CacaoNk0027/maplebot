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
        if (!message.channel.permissionsFor(message.author.id)) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', `no cuentas con los permisos necesarios para completar esta acción..\nrequieres \`${permissions['ManageMessages']}\``),
                color: 0xff0000
            }]
        }); 
        let msg = await message.reply({
            embeds: [{
                author: {
                    name: message.author.username,
                    icon_url: message.author.avatarURL({ forceStatic: false })
                },
                description: `Estas en el menu de blacklist, a continuacion elije una de las 3 opciones de los botones de abajo`,
                color: 0xfcf5d4,
                title: 'Blacklist'
            }],
            components: [{
                type: 1,
                components: [{
                    custom_id: "blacklist.addWords",
                    emoji: "📑",
                    label: "Agregar palabras",
                    style: 3,
                    type: 2
                }, {
                    custom_id: "blacklist.deleteWords",
                    emoji: "❌",
                    label: "Eliminar palabras",
                    style: 4,
                    type: 2
                }, {
                    custom_id: "blacklist.watchWords",
                    emoji: "❔",
                    label: "Ver palabras establecidas",
                    style: 2,
                    type: 2
                }]
            }]
        });
        const collector = msg.createMessageComponentCollector({ time: ms('5m') });
        collector.on('end', async () => {
            await msg.edit({
                components: [{
                    type: 1,
                    components: [{
                        custom_id: "blacklist.addWords",
                        emoji: "📑",
                        label: "Agregar palabras",
                        style: 3,
                        disabled: true,
                        type: 2
                    }, {
                        custom_id: "blacklist.deleteWords",
                        emoji: "❌",
                        label: "Eliminar palabras",
                        style: 4,
                        disabled: true,
                        type: 2
                    }, {
                        custom_id: "blacklist.watchWords",
                        emoji: "❔",
                        label: "Ver palabras establecidas",
                        style: 2,
                        disabled: true,
                        type: 2
                    }]
                }]
            })
        })
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
    name: 'blacklist',
    alias: ['listanegra'],
    id: '032',
    description: 'crea o añade palabras a una lista negra',
    category: 'moderacion',
    options: [{
        name: "(add / delete)",
        required: true
    }, {
        name: "palabras...",
        required: true
    }],
    permissions: {
        user: ['ManageMessages'],
        bot: ['SendMessages', 'EmbedLinks', 'ManageMessages']
    },
    status: {
        code: 0,
        reason: "en desarrollo"
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}