const discord = require('discord.js')

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
                color: 0x000000,
                image: {
                    url: 'attachment://wasted.png'
                }
            }],
            files: [new discord.AttachmentBuilder().setDescription('Avatar de usuario en wasted @Maple bot').setName('wasted.png').setFile(await canvacord.Canvacord.wasted(user.avatarURL({ forceStatic: true, size: 2048, extension: 'png' })))]
        });
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
    name: "wasted",
    alias: ['miss'],
    id: "028",
    description: "crea una imagen wasted con tu avatar",
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