const discord = require('discord.js')
const models = require('maplebot_models')
const ms = require('ms');
const config = require('../../utils/exports')
const canvacord = require("canvacord")

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        const { user } = await config.fetchUser({ message: message, args: args });
        await message.reply({
            embeds: [{
                color: config.randomColor(),
                image: {
                    url: 'attachment://rainbow.png'
                }
            }],
            files: [new discord.AttachmentBuilder().setDescription('Avatar de usuario en arcoiris @Maple bot').setName('rainbow.png').setFile(await canvacord.Canvacord.rainbow(user.avatarURL({ forceStatic: true, size: 2048, extension: 'png' })))]
        });
    } catch (error) {
        await models.utils.error(message, error)
    }
}

/**
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {

}

exports.help = {
    name: "rainbow",
    alias: ['gay', 'arcoiris'],
    id: "025",
    description: "torna tu avatar un poco colorido",
    category: "diversion",
    options: [{
        name: "usuario",
        required: false
    }],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks']
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3ms') / 1000)
}