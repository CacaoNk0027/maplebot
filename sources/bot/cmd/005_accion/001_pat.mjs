import * as config from '../../config/config.mjs'
import * as discord from 'discord.js'

const name = 'pat'
const id = '001'

let help = {
    alias: ['caricia', 'acariciar'],
    description: 'Acaricia a un usuario',
    category: '005',
    options: [{
        name: 'user',
        alias: [],
        description: 'acaricia a un usuario',
        required: true,
        options: []
    }], 
    permissions: {
        bot: [],
        user: []
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
    let _user = null;
    if(!args[0]) {
        await message.reply({
            embeds: [{
                color: discord.Colors.Red,
                
            }]
        })
        return 1;
    }
    _user = new config.User(client, message, args[0]);
    if(!(await _user.valid())) {
        return 1
    }
    if(_user.getUser().id == message.author.id) {
        return 0
    }
    if(_user.getUser().id == client.user.id) {
        return 0
    }
    
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