import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const name = 'member'
const id = '003'

let help = {
    alias: ['miembro', 'm', 'member'],
    description: 'Muestra el perfil de servidor de un usuario',
    category: '002',
    options: [],
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
    validator = new config.Member(message, identifier);

    if((await validator.valid())) {
        profile(message, validator.getMember())
        return 0
    }

    validator.setMember(await message.member.fetch())
    profile(message, validator.getMember())
    return 0
}

/**
 * @param {discord.Client} client 
 * @param {discord.Interaction} interaction 
 */
async function slash(client, interaction) {
    return 0
}

/**
 * @param {discord.Message} target 
 * @param {discord.GuildMember} member 
 */
async function profile(target, member) {
    let user = member.user;
    let roles = member.roles.cache.filter(rol => rol != member.guild.roles.everyone).map(rol => `<@&${rol.id}>`)
    await target.reply({
        embeds: [{
            author: {
                name: user.username,
                icon_url: user.avatarURL({ forceStatic: false })
            },
            description: `Nombre en servidor: ${member.displayName || 'sin nombre global'}\nApodo de servidor: ${member.nickname || 'Sin apodo de servidor'}\nID: \`${user.id}\``,
            color: member.displayColor || member.user.accentColor || config.random_color(),
            fields: [{
                name: '<:newmember:1262144151844028537> | Fecha de ingreso',
                value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
            }, {
                name: '<:quest:1262143716643311678> | Roles',
                value: roles.length > 1 ? roles.join(' '): 'Sin roles'
            }],
            thumbnail: {
                url: member.avatarURL({ forceStatic: false }) || user.avatarURL({ forceStatic: false })
            },
            title: 'Miembro del servidor'
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