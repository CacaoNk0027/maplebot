import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const name = 'avatar'
const id = '001'

let help = {
    alias: ['imagen', 'av', 'ic'],
    description: 'Muestra el avatar de un usuario',
    category: '002',
    options: [{
        name: 'user',
        alias: [],
        description: 'menciona o coloca la id de un usuario',
        required: false,
        options: []
    }, {
        name: 'member',
        alias: ['miembro', 'm', 'mem'],
        description: 'si el usuario cuenta con un perfil de servidor, muestra su avatar',
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
    let validator

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

/**
 * @param {discord.Message} message 
 * @param {config.User} validator 
 * @param {string} identifier 
 */
async function conditions(message, validator, identifier) {
    let member_validator = new config.Member(message, validator.getUser().id)
    if (help.options[1].name == identifier || help.options[1].alias.includes(identifier)) {
        if((await member_validator.valid())) {
            member_avatar(message, member_validator.getMember())
            return 0
        }
        member_validator.setMember(await message.member.fetch())
        member_avatar(message, member_validator.getMember())
        return 0
    }
    global_avatar(message, validator.getUser())
}

/**
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
async function slash(client, interaction) {
    return 0
}

/**
 * @param {discord.Message} target 
 * @param {discord.User} user 
 */
async function global_avatar(target, user) {
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
}

/**
 * @param {discord.Message} target 
 * @param {discord.GuildMember} member 
 */
async function member_avatar(target, member) {
    let avatarUrl = member.avatarURL({ forceStatic: false, size: 1024 })
    if (!avatarUrl) {
        await target.reply({
            embeds: [{
                color: discord.Colors.Red,
                description: `> El usuario no cuenta con un avatar de servidor.`
            }]
        })
        return 0
    }
    await target.reply({
        embeds: [{
            color: member.accentColor || config.random_color(),
            description: `[Url del avatar de servidor](${avatarUrl})`,
            image: {
                url: avatarUrl
            },
            title: `👤 | Avatar de ${member.user.globalName || member.user.username}`
        }]
    })
}

export {
    name,
    id,
    help,
    main,
    slash
}