import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const name = 'user'
const id = '005'

let help = {
    alias: [ 'usuario', 'userinfo' ],
    description: 've informacion acerca de un usuario\nopciones del comando: info, avatar, banner, member',
    category: '001',
    options: [{
        name: 'usuario',
        description: 'Menciona o coloca la id de un usuario',
        required: false
    }, {
        name: '{opciones}',
        description: 'selecciona entre las opciones mencionadas',
        required: false
    }],
    permissions: {
        user: [],
        bot: []
    },
    inactive: true,
    reason: "comando en desarrollo",
    nsfw: false,
    cooldown: 3
}

let options = [ 'info', 'avatar', 'banner', 'member', 'miembro', 'imagen', 'informacion', 'i', 'a', 'b', 'm' ]

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {string[]} args 
 */
async function main(client, message, args) {
    let identifier = args[0] || message.author.id;
    return 0
}

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