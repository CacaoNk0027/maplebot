import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const name = 'user'
const id = '005'

let help = {
    alias: ['usuario', 'userinfo'],
    description: 've informacion acerca de un usuario\nopciones del comando: info, avatar, banner, member',
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
        description: 'muestra informacion acerca del usuario',
        required: false,
        options: []
    }, {
        name: 'avatar',
        alias: ['imagen', 'av', 'ic', 'icon'],
        description: 'muestra el avatar del usuario',
        required: false,
        options: []
    }, {
        name: 'banner',
        alias: ['fondo', 'background', 'b'],
        description: 'muestra el banner del usuario',
        required: false,
        options: []
    }, {
        name: 'member',
        alias: ['miembro', 'm', 'mem'],
        description: 'muestra el perfil de miembro del usuario',
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
    let identifier = args[0]
    let validator;

    validator = new config.User(client, message, identifier)
    if ((await validator.valid())) {
        identifier = args[1] || args[0]
        conditions(message, validator, identifier)
        return 0
    }
    validator.setUser(await message.author.fetch())
    conditions(message, validator, identifier)
    return 0
}

async function slash(client, interaction) {
    return 0
}

async function conditions(message, validator, identifier) {
    if (help.options[1].name == identifier || help.options[1].alias.includes(identifier) || validator.getUser().id == identifier || !identifier) {
        info(message, validator.getUser())
        return 0;
    }
    if (help.options[2].name == identifier || help.options[2].alias.includes(identifier)) {
        avatar(message, validator.getUser())
        return 0;
    }
    if (help.options[3].name == identifier || help.options[3].alias.includes(identifier)) {
        banner(message, validator.getUser())
        return 0;
    }
    if (help.options[4].name == identifier || help.options[4].alias.includes(identifier)) {
        await message.reply({
            embeds: [{
                color: discord.Colors.Yellow,
                description: '> El perfil de miembro aun no esta disponible por el momento'
            }]
        })
        return 0;
    }
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

/**
 * @param {discord.Message} target
 * @param {discord.User} user
 */
async function avatar(target, user) {
    let avatarUrl = user.avatarURL({ forceStatic: false, size: 1024 })
    if (!avatarUrl) {
        await target.reply({
            embeds: [{
                color: discord.Colors.Red,
                description: `> El usuario no cuenta con un avatar.`
            }]
        })
        return 0
    }
    await target.reply({
        embeds: [{
            color: user.accentColor || config.random_color(),
            description: `[Url del avatar](${avatarUrl})`,
            image: {
                url: avatarUrl
            },
            title: `👤 | Avatar de ${user.globalName || user.username}`
        }]
    })
    return 0
}


/**
 * @param {discord.Message} target
 * @param {discord.User} user
 */
async function banner(target, user) {
    let bannerUrl = user.bannerURL({ forceStatic: false, size: 1024 })
    if (!bannerUrl) {
        await target.reply({
            embeds: [{
                color: discord.Colors.Red,
                description: `> El usuario no cuenta con un banner personalizado.`
            }]
        })
        return 0
    }
    await target.reply({
        embeds: [{
            color: user.accentColor || config.random_color(),
            description: `[Url del banner](${bannerUrl})`,
            image: {
                url: bannerUrl
            },
            title: `🖼️ | Banner de ${user.globalName || user.username}`
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