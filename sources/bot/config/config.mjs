import * as discord from 'discord.js'
import __package from '../../../package.json' assert { type: 'json' }
import __jinterc from '../assets/interactions.json' assert { type: 'json' }

const prefix = 'm!'

const theme_color = 0xfcbc6d
const alt_theme_color = 0x28594b

let default_client_permissions = [
    discord.PermissionFlagsBits.SendMessages,
    discord.PermissionFlagsBits.EmbedLinks,
    discord.PermissionFlagsBits.ReadMessageHistory
]

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
    let id_list = ['801603753631285308', '553736828860235796', '773838483793641482']
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
    let userFlags = user.flags?.toArray();
    let badgeList = userFlags.length > 0 ? userFlags.map(flag => flags[flag]).join(' ') : 'Sin insignias';
    return badgeList
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
                return true
            } catch {
                this.#user = null
            }
        }
        return false
    }

    getUser() {
        return this.#user
    }

    setUser(user) {
        this.#user = user;
    }
}

export {
    prefix,
    theme_color,
    alt_theme_color,
    __package,
    default_client_permissions,
    random_color,
    slash_manager,
    allowed_id,
    code_text,
    por_barra,
    get_user_flags,
    User
}