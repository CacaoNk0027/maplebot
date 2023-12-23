const discord = require('discord.js')

const ms = require('ms');
const { Alert } = require('../../utils/exports');

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        let texto = args.join(' ');
        if(!texto || texto.length <= 0) return await message.reply({
            embeds: [{
                description: config.statusError('error', "el parametro <texto> es requerido"),
                color: 0xff0000
            }]
        });
        if(texto.length > 40) return await message.reply({
            embeds: [{
                description: config.statusError('error', "el texto escrito no puede tener mas de 40 caracteres"),
                color: 0xff0000
            }]
        });
        return await message.reply({
            embeds: [{
                image: {
                    url: "attachment://alert.png"
                },
                color: 0xfcf5d4
            }],
            files: [
                new discord.AttachmentBuilder()
                .setDescription('Alerta de google hecha con node-canvas @Maple Bot')
                .setName('alert.png')
                .setFile(new Alert('www.google.com', texto))
            ]
        })
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
    name: "alert",
    alias: ['googlealert', 'alerta'],
    id: "021",
    description: "genera una alerta de google con el texto que quieras",
    category: "diversion",
    options: [{
        name: "texto",
        required: true
    }],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks', 'AttachFiles']
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3ms') / 1000)
}