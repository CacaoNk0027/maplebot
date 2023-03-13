const discord = require('discord.js')
const models = require('maplebot_models')
const ms = require('ms')

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        if (!args[0] || args.join(' ').length <= 1) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', "debes escribir una pregunta de respuesta cerrada"),
                color: 0xff0000
            }]
        }); else if (!args.join(' ').endsWith('?')) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', "debes terminar las preguntas con **?**"),
                color: 0xff0000
            }]
        }); else {
            let respuestas = [
                'para nada :/',
                'claro que no u.u',
                'no -_-',
                'quizas... no ,\':^',
                'quizas u-u',
                'quizas... si  o-o',
                'si :3',
                'claro que si! ^^',
                'pero porsupuesto que si! UwU',
                'no lo se',
                'eh... puedes preguntar de nuevo?',
                '... no me vuelvas a hacer esa pregunta',
                'nose espero haberte ayudado',
                'if(tupregunta == \'algo sin sentido\') return;',
                'que'
            ]
            return await message.reply({
                content: respuestas[Math.floor(Math.random() * respuestas.length)]
            })
        }
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
    name: "8ball",
    alias: [],
    id: "035",
    description: "preguntame algo para que lo responda",
    category: "diversion",
    options: [{
        name: "pregunta",
        required: true
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