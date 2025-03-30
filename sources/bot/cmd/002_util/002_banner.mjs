import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const name = 'banner'
const id = '002'

let help = {
    alias: ['fondo', 'background', 'b'],
    description: 'Muestra el banner de un usuario',
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
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
async function slash(client, interaction) {
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
            member_banner(message, member_validator.getMember())
            return 0
        }
        member_validator.setMember(await message.member.fetch())
        member_banner(message, member_validator.getMember())
        return 0
    }
    global_banner(message, validator.getUser())
}



/**
 * @param {discord.Message} target 
 * @param {discord.User} user 
 */
async function global_banner(target, user) {
    let bannerUrl = user.bannerURL({ forceStatic: false, size: 1024 })
    if (!bannerUrl) {
        await target.reply({
            embeds: [{
                color: discord.Colors.Red,
                description: `> El usuario no cuenta con un banner.`
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
}

/**
 * @param {discord.Message} target 
 * @param {discord.GuildMember} member 
 */
async function member_banner(target, member) {
    let bannerUrl = await config.bannerURL(member, {size: 1024, forceStatic: false})
    if (!bannerUrl) {
        await target.reply({
            embeds: [{
                color: discord.Colors.Red,
                description: `> El usuario no cuenta con un banner de servidor.`
            }]
        })
        return 0
    }
    await target.reply({
        embeds: [{
            color: member.accentColor || config.random_color(),
            description: `[Url del banner de servidor](${bannerUrl})`,
            image: {
                url: bannerUrl
            },
            title: `🖼️ | Banner de ${member.user.globalName || member.user.username}`
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