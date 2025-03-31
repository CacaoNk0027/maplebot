import * as discord from 'discord.js'
import __package from '../../../package.json' assert { type: 'json' }
import __jinterc from '../assets/interactions.json' assert { type: 'json' }
import __jconfig from '../assets/configs.json' assert { type: 'json' }

import Channels from '../config/models/channels.mjs'
import Prefix from './models/prefix.mjs'
import Welcome from './models/welcome.mjs'

const prefix = async (guildId) => (await Prefix.findOne({guildId}))?.prefix || 'm!'

const theme_color = 0xfcbc6d
const alt_theme_color = 0x28594b

let default_client_permissions = [
    discord.PermissionFlagsBits.SendMessages,
    discord.PermissionFlagsBits.EmbedLinks,
    discord.PermissionFlagsBits.ReadMessageHistory
]

let help_menu = __jconfig.help_menu

function random_color() {
    let array = Object.entries(discord.Colors).map(([_, num]) => num)
    return array[Math.floor(Math.random() * array.length)]
}

/**
 * @param {discord.Client} client
 */
async function slash_manager(client) {
    let commands
    try {
        commands = await client.application?.commands.set(__jinterc)
        console.info(`Total de interacciones cargadas:`, commands.size)
    } catch (error) {
        console.error(error)
    }
    return 0
}

/**
 * valida una id y devuelve un booleano
 * @param {string} id 
 */
function allowed_id(id) {
    let id_list = ['801603753631285308', '553736828860235796', '773838483793641482', '345709334963159040']
    return id_list.includes(id)
}

function code_text(text, format) {
    return '```' + format + '\n' + text + '\n```'
}

function por_barra(porcentaje, longitud = 10) {
    let llenos = Math.round((porcentaje / 100) * longitud)
    let vacios = longitud - llenos
    return '█'.repeat(llenos) + '_'.repeat(vacios)
}

/**
 * @param {discord.User} user
 */
function get_user_flags(user) {
    let flags = {
        Staff: '<:staff:1262144147687477310>',
        Partner: '<:partner:1262143727669874761>',
        Hypesquad: '<:hypesquad:1262143722502754394>',
        BugHunterLevel1: '<:bugHunter:1262143731235164222>',
        HypeSquadOnlineHouse1: '<:bravery:1262144150632005763>',
        HypeSquadOnlineHouse2: '<:brilliance:1262143738151702569>',
        HypeSquadOnlineHouse3: '<:balance:1262143741645553684>',
        PremiumEarlySupporter: '<:earlysuporter:1262143724524404838>',
        BugHunterLevel2: '<:goldBugHunter:1262144148371406961>',
        VerifiedDeveloper: '<:verifiedDeveloper:1262143723542675488>',
        CertifiedModerator: '<:moderatorprograms:1262143721105920121>',
        ActiveDeveloper: '<:activeDeveloper:1262144149537423464>'
    }
    let userFlags = user.flags?.toArray()
    let badgeList = userFlags.length > 0 ? userFlags.map(flag => flags[flag]).join(' ') : 'Sin insignias'
    return badgeList
}

/**
 * @param {discord.GuildMember} member 
 * @param {discord.ImageURLOptions} options 
 */
async function bannerURL(member, options) {
    const rest = new discord.REST().setToken(process.env.TOKEN)
    const cdn = new discord.CDN()
    let apiMember, tempUrl, url, ext
    try {
        apiMember = await rest.get(discord.Routes.guildMember(member.guild.id, member.user.id))

        if (!apiMember.banner) return null

        tempUrl = cdn.guildMemberBanner(member.guild.id, member.user.id, apiMember.banner, options)
        url = new URL(tempUrl)
        ext = url.pathname.split('.').pop()
        url.pathname = url.pathname.replace(`.${ext}`, `s/${apiMember.banner}.${ext}`)

        return url.toString()
    } catch {
        return null
    }
}

class User {
    // propiedades privadas
    #client
    #message
    #identifier
    #user

    /**
     * Constructor de la clase
     * @param {discord.Client} client 
     * @param {discord.Message} message 
     * @param {string} identifier 
     */
    constructor(client, message, identifier) {
        this.#client = client
        this.#message = message
        this.#identifier = identifier
        this.#user = null
    }

    async valid() {
        if (this.#message.mentions.users.size > 0) {
            try {
                this.#user = await this.#message.mentions.users.first().fetch()
            } catch {
                this.#user = null
                return false
            }
            return true
        }

        if (/^\d{17,19}$/.test(this.#identifier)) {
            try {
                this.#user = await this.#client.users.fetch(this.#identifier)
            } catch {
                this.#user = null
                return false
            }
            return true
        }
        return false
    }
    /**
     * @returns {discord.User | null}
     */
    getUser() {
        return this.#user
    }

    setUser(user) {
        this.#user = user
    }
}

class Member {
    #message
    #identifier
    #member
    
    /**
     * @param {discord.Message} message 
     * @param {string} identifier 
     */
    constructor(message, identifier) {
        this.#message = message
        this.#identifier = identifier
        this.#member = null
    }

    async valid() {
        if (this.#message.mentions.members.size > 0) {
            try {
                this.#member = await this.#message.mentions.members.first().fetch()
            } catch {
                this.#member = null
                return false
            }
            return true
        }

        if (/^\d{17,19}$/.test(this.#identifier)) {
            try {
                this.#member = await this.#message.guild.members.fetch(this.#identifier)
            } catch {
                this.#member = null
                return false
            }
            return true
        }
        return false
    }
    /**
     * @returns {discord.GuildMember}
     */
    getMember() {
        return this.#member
    }
    setMember(member) {
        this.#member = member
    }
}

function help_menu_options() {
    let options = new Set()
    __jconfig.help_menu.forEach(option => {
        options.add({
            label: option.name,
            emoji: option.emoji.match(/\d+(?=>)/g)?.shift() || option.emoji,
            description: option.description,
            value: option.id
        })
    })
    return [...options]
}

/**
 * 
 * @param {string} prefix 
 * @param {} commands 
 * @param {string} category
 * @returns 
 */
function text_field_commmands(prefix, commands, category) {
    let fi_comands = commands.filter(command => command.help.category == category)
    let fo_commands = fi_comands.map((c, name) => ((c.help.inactive ? '[🔴] ': '[🟢] ') + prefix + name).padEnd(20, ' '))
    let groups = [], i, finalText

    for (i = 0; i < fo_commands.length; i += 3) {
        groups.push(fo_commands.slice(i, i + 3).join(''))
    }

    finalText = groups.join('\n')
    return code_text(finalText)
}

/**
 * 
 * @param {discord.Message} message
 * @param {string} channelId 
 */
async function validate_channel(message, channelId) {
    let channel = await message.client.channels.fetch(channelId).catch(() => null)
    let embed = new discord.EmbedBuilder({
        color: discord.Colors.Red
    })
    if(!channel) {
        await message.reply({
            embeds: [embed.setDescription('no se ha podido localizar el canal mencionado')]
        })
        return null
    }
    if(channel.type != discord.ChannelType.GuildText) {
        await message.reply({
            embeds: [embed.setDescription('Se debe mencionar un canal de texto, no otro tipo de canal')]
        })
        return null
    }
    if(!channel.permissionsFor(message.guild.members.me).has('SendMessages')) {
        await message.reply({
            embeds: [embed.setDescription('No puedes establecer un canal en el que no puedo hablar, cambia los permisos para enviar mensajes')]
        })
        return null
    }
    return channel.id
}

function text_wl_vars(text, variables) {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
        return variables[key] !== undefined ? variables[key] : match
    })
}

export {
    prefix,
    theme_color,
    alt_theme_color,
    __package,
    default_client_permissions,
    help_menu,
    random_color,
    slash_manager,
    allowed_id,
    code_text,
    por_barra,
    get_user_flags,
    bannerURL,
    help_menu_options,
    text_field_commmands,
    validate_channel,
    text_wl_vars,
    User,
    Member,
    Channels,
    Prefix,
    Welcome
}