import * as discord from 'discord.js'
import emojiRegex from 'emoji-regex'
import * as config from '../../config/config.mjs'

const name = 'emoji'
const id = '005'

let help = {
    alias: ['emote'],
    description: 'Amplia un emoji u obten información',
    category: '002',
    options: [{
        name: 'emoji',
        alias: [],
        description: 'Coloca un emoji',
        required: true,
        options: []
    }, {
        name: 'info',
        alias: ['informacion', 'i'],
        description: 'Muestra la información del emoji',
        required: false,
        options: []
    }],
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
    let emojiUrl, parsed, emoji
    let identifier = args[0]
    let cdn = new discord.CDN()
    let embed = new discord.EmbedBuilder({
        color: discord.Colors.Red
    })

    if (!identifier) {
        await message.reply({ embeds: [embed.setDescription('> la opcion `<emoji>` es requerida.')] })
        return 1
    }

    parsed = discord.parseEmoji(identifier)

    if (emojiRegex().test(identifier)) {
        await message.reply({ embeds: [embed.setDescription('> no puedes colocar un emoji preterminado')] })
        return 1
    }

    if (!parsed.id) {
        await message.reply({ embeds: [embed.setDescription('> el emoji que haz colocado es invalido')] })
        return 1
    }

    identifier = args[1]

    emojiUrl = cdn.emoji(parsed.id, { extension: parsed.animated ? 'gif' : 'webp' })

    if (help.options[1].name == identifier || help.options[1].alias.includes(identifier)) {
        try {
            emoji = await message.guild.emojis.fetch(parsed.id)

            embed.setTitle(`🏓 Emoji | ${emoji.name}`)
                .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ forceStatic: false }) })
                .setColor(config.random_color())
                .setDescription(`[URL del emoji](${emojiUrl})`)
                .setFields([{
                    name: '🆔 | ID',
                    value: `\`${emoji.id}\``,
                    inline: true
                }, {
                    name: '👤 | Autor',
                    value: `**${(await emoji.fetchAuthor())?.globalName || (await emoji.fetchAuthor())?.username || 'Autor desconocido'}**`,
                    inline: true
                }, {
                    name: '📽️ | Tipo',
                    value: emoji.animated ? 'Animado' : 'Estatico',
                    inline: true
                }, {
                    name: '🕑 | Fecha de creación',
                    value: `<t:${Math.floor(emoji.createdTimestamp / 1000)}:F>`
                }, {
                    name: '📍 | Nombre completo',
                    value: config.code_text(`<:${emoji.identifier}>`)
                }]).setThumbnail(emojiUrl)

            await message.reply({
                embeds: [embed]
            })
        } catch (error) {
            console.log(error)
            await message.reply({ embeds: [embed.setDescription('> El emoji debe ser de este servidor para poder obtener informacion del mismo.')] })
            return 1
        }
        return 0
    }

    await message.reply(emojiUrl)

    return 0
}

/**
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
async function slash(client, interaction) {
    return 0
}

export {
    name,
    id,
    help,
    main,
    slash
}