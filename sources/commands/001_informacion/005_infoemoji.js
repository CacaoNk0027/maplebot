const discord = require('discord.js')
const models = require('maplebot_models')
const configs = require('../../utils/exports')
const ms = require('ms')
const emoji_regex = require('emoji-regex')()
const moment = require('moment')

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        if(!args[0]) return await message.reply({ embeds: [{
            description: models.utils.statusError('error', 'no haz colocado ningun emoji'),
            color: 0xff0000
        }] }); else if(emoji_regex.test(args[0]) == true || !args[0].match(/<a:.+?:\d{19}>|<:.+?:\d{19}>|<a:.+?:\d{18}>|<:.+?:\d{18}>/g)) return await message.reply({ embeds: [{
            description: models.utils.statusError('error', 'el emoji debe de ser personalizado no preterminado'),
            color: 0xff0000
        }] }); else {
            let emoji_collection = (await message.guild.emojis.fetch())
            if(!emoji_collection.has(args[0].match(/\d{19}|\d{18}/g)[0])) return await message.reply({ embeds: [{
                description: models.utils.statusError('error', 'el emoji debe de ser de este servidor'),
                color: 0xff0000
            }] }); else {
                let emoji = emoji_collection.get(args[0].match(/\d{19}|\d{18}/g)[0]);
                await message.reply({
                    embeds: [{
                        author: {
                            name: message.guild.name,
                            icon_url: message.guild.iconURL({forceStatic: false})
                        },
                        color: 0xffffff,
                        description: `📄 **nombre |** ${emoji.name}\n🆔 **ID |** ${emoji.id}`,
                        fields: [
                            { name: `Es animado?`, value: `${emoji.animated ? 'El emoji es animado' : 'El emoji es estatico'}`, inline: true },
                            { name: 'Fecha de creación', value: `<t:${moment(emoji.createdAt).unix()}:f>`, inline: true },
                            { name: `Este emoji eta disponible?`, value: `${emoji.available ? "si esta disponible" : "no esta disponible"}`, inline: true },
                            { name: "creado por..", value: `\`\`\`\nUser ID  | ${emoji.author.id}\nUsername | ${emoji.author.username}\n\`\`\`` }
                        ],
                        footer: {
                            text: `requerido por ${message.author.username}`,
                            icon_url: message.author.avatarURL({ forceStatic: false })
                        },
                        title: `Emoji : ${emoji.name}`,
                        url: emoji.url,
                        thumbnail: {
                            url: emoji.url
                        }
                    }]
                })
            }
        }
    } catch (error) {
        await models.utils.error(message, error); console.error(error); return 0;
    }
}

/**
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {
    try {
        
    } catch (error) {
        console.error(error)
        await configs.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    name: 'infoemoji',
    alias: ['emojiinfo'],
    id: '005',
    description: 'Muestra información sobre un emoji',
    category: 'informacion',
    options: [{
        name: 'emoji',
        required: true
    }],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks']
    },
    status: {
        code: 1,
        reason: null,
    },
    isNsfw: false,
    cooldown: (ms('3s')/1000)
}