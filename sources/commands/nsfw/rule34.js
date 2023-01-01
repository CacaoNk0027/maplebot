const discord = require('discord.js')
const { args } = require('../../typings/index.d.ts')
const models = require('maplebot_models')
const configs = require('../../utils/exports')
const booru = require('booru')
const ms = require('ms')

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {args} args 
 */
exports.text = async (client, message, args) => {
    try {
        if(!args[0]) {
            try {
                let query = await booru.search('rule34', [], { random: true, limit: 3 })
                await message.reply({
                    content: `\`\`\`\n🔞 | rule34.xxx [busqueda random]\n\`\`\`${query.map((item, number) => `#${number} ${item.fileUrl}`).join('\n')}`
                })
            } catch (error) {
                console.error(error)
                await models.utils.error(message, error)
            }
        } else {
            try {
                let query = await booru.search('rule34', args, { random: true, limit: 3 })
                if(query.length <= 0) return message.reply({
                    embeds: [{
                        description: models.utils.statusError('warn', 'no se han podido encontrar resultados de la busqueda, intenta poner los tags bien o escribir otros tags'),
                        color: 0xffff00
                    }]
                }); return await message.reply({
                    content: `\`\`\`\n🔞 | rule34.xxx [ ${args.join(', ') } ]\n\`\`\`${query.map((item, number) => `**#${number+1}** - ${item.fileUrl}`).join('\n')}`
                })
            } catch (error) {
                console.error(error)
                await models.utils.error(message, error)
            }
        }
    } catch (error) {
        await models.utils.error(message, error)
        console.error(error)
    }
}

/**
 * @param {discord.Client} client 
 * @param {discord.Interaction} interaction 
 */
exports.slash = async (client, interaction) => {
    try {
        
    } catch (error) {
        await configs.interactionErrorMsg(interaction, error);
    }
}

exports.help = {
    name: "rule34",
    alias: ["r34"],
    id: "010",
    description: "busca imagenes en rule34.xxx",
    category: "nsfw",
    options: [{
        name: "tags",
        required: false
    }],
    permissions: {
        user: [],
        bot: ["SendMessages", "EmbedLinks"]
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: true,
    cooldown: (ms('3s')/1000)
}