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
        const { user } = await config.fetchUser({ message: message, args: args })
        let img;
        if (user.banner == null && user.accentColor !== (null || undefined)) img = await config.newColorImage(user.hexAccentColor); else img = { embedUrl: null, attachment: null };
        let embed = new discord.EmbedBuilder({
            author: {
                name: message.author.username,
                icon_url: message.author.avatarURL({ forceStatic: false })
            },
            color: user.banner ? 0xfcf5d4 : (user.accentColor ? user.accentColor : 0xff0000),
            description: user.id == message.author.id ? (user.banner ? `[Banner URL](${user.bannerURL({ forceStatic: false, size: 2048 })})` : (user.accentColor ? `No cuentas con un banner pero si con un color personalizado :3` : models.utils.statusError('error', `No cuentas con un banner`))) : (user.banner ? `[Banner URL](${user.bannerURL({ forceStatic: false, size: 2048 })})` : (user.accentColor ? `**${user.username}** no cuenta con un banner pero si un color personalizado :3` : models.utils.statusError('error', `**${user.username}** no cuenta con un banner`))),
            title: user.id == message.author.id ? (user.banner ? 'Tu banner' : (user.accentColor ? `Tu color de banner` : `Pff...`)) : (user.banner ? `Banner de ${user.username}` : (user.accentColor ? `Color de banner de ${user.username}` : "Pff...")),
            image: { url: user.banner ? user.bannerURL({ forceStatic: false, size: 2048 }) : (user.accentColor ? img.embedUrl : null) },
            footer: { text: (user.banner ? null : (user.accentColor ? `Color: ${user.hexAccentColor}` : null)), icon_url: null }
        })
        if (user.banner == null && user.accentColor !== (null || undefined)) return await message.reply({
            embeds: [embed], files: img.attachment == null ? [] : [img.attachment]
        }); else return await message.reply({ embeds: [embed] });
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
    name: 'banner',
    alias: ['fondo'],
    id: '022',
    description: 'Muestra un encriptado con el banner de un usuario o el tuyo',
    category: 'utilidad',
    options: [{
        name: 'usuario',
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
    cooldown: (ms('3s') / 1000)
}