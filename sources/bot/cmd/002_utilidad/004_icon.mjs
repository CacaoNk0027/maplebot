import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const name = 'icon'
const id = '004'

let help = {
    alias: ['icono', 'servericon'],
    description: 'Muestra el icono del servidor',
    category: '002',
    options: [],
    permissions: {
        user: [],
        bot: []
    },
    inactive: false,
    reason: null,
    nsfw: false,
    cooldown: 3
}

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {string[]} args 
 */
async function main(client, message, args) {
    icon(message)
    return 0
}

/**
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
async function slash(client, interaction) {
    icon(interaction)
    return 0
}

/**
 * @param {discord.Message | discord.CommandInteraction} target 
 */
async function icon(target) {
    let iconUrl = target.guild.iconURL({ forceStatic: false, size: 1024 })
    let embed = new discord.EmbedBuilder()
    if (!iconUrl) {
        embed.setColor(discord.Colors.Red)
            .setDescription("> Este servidor no cuenta con un icono")
        if (target instanceof discord.CommandInteraction) {
            await target.reply({
                embeds: [embed],
                ephemeral: true
            })
        } else {
            await target.reply({
                embeds: [embed]
            })
        }
        return 0
    }

    embed.setColor(config.random_color())
        .setDescription(`[URL del icono](${iconUrl})`)
        .setTitle(`🖼️ | Icono del servidor`)
        .setAuthor({name: target.guild.name, iconURL: iconUrl })
        .setImage(iconUrl)

    await target.reply({
        embeds: [embed]
    })

    return 0
}

export {
    name,
    id,
    help,
    main,
    slash
}