import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'
import * as avatar from '../002_util/001_avatar.mjs'
import * as banner from '../002_util/002_banner.mjs'
import * as member from '../002_util/003_member.mjs'

const name = 'user'
const id = '005'

let help = {
    alias: ['usuario', 'userinfo'],
    description: 'Ve informacion acerca de un usuario',
    category: '001',
    options: [{
        name: 'user',
        alias: [],
        description: 'Menciona o coloca la id de un usuario',
        required: false,
        options: []
    }, {
        name: 'info',
        alias: ['informacion', 'in'],
        description: 'Muestra informacion acerca del usuario',
        required: false,
        options: []
    }, {
        name: 'avatar',
        alias: avatar.help.alias,
        description: avatar.help.description,
        required: false,
        options: avatar.help.options
    }, {
        name: 'banner',
        alias: banner.help.alias,
        description: banner.help.description,
        required: false,
        options: banner.help.options
    }, {
        name: 'member',
        alias: member.help.alias,
        description: member.help.description,
        required: false,
        options: member.help.options
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
    let identifier = args[0]
    let validator;

    validator = new config.User(client, message, identifier)
    if ((await validator.valid())) {
        identifier = args[1] || args[0]
        // la neta se que puedo quitar el identifier de la funcion pero cambiarlo me da hueva :uxd
        conditions(message, validator, identifier, args)
        return 0
    }
    validator.setUser(await message.author.fetch())
    conditions(message, validator, identifier, args)
    return 0
}

async function slash(client, interaction) {
    return 0
}

/**
 * @param {discord.Message} message 
 * @param {config.User} validator 
 * @param {string} identifier 
 * @param {string[]} args 
 */
async function conditions(message, validator, identifier, args) {
    let simple_args = [validator.getUser().id, args.pop()]
    if (help.options[1].name == identifier || help.options[1].alias.includes(identifier) || validator.getUser().id == identifier || !identifier) {
        info(message, validator.getUser())
        return 0;
    }
    if (help.options[2].name == identifier || help.options[2].alias.includes(identifier)) {
        avatar.main(message.client, message, simple_args)
        return 0;
    }
    if (help.options[3].name == identifier || help.options[3].alias.includes(identifier)) {
        banner.main(message.client, message, simple_args)
        return 0;
    }
    if (help.options[4].name == identifier || help.options[4].alias.includes(identifier)) {
        member.main(message.client, message, simple_args);
        return 0;
    }
    info(message, validator.getUser())
}

/**
 * @param {discord.Message} target
 * @param {discord.User} user
 */
async function info(target, user) {
    await target.reply({
        embeds: [{
            author: {
                name: user.username,
                icon_url: user.avatarURL({ forceStatic: false })
            },
            description: `Nombre global: ${user.globalName || 'sin nombre global'}\nID: \`${user.id}\``,
            color: user.accentColor || config.random_color(),
            fields: [{
                name: 'Fecha de ingreso a discord',
                value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`
            }, {
                name: `Insignias`,
                value: config.get_user_flags(user)
            }],
            thumbnail: {
                url: user.avatarURL({ forceStatic: false })
            },
            title: `Informacion del usuario`
        }]
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