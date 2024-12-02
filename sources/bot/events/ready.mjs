import * as discord from 'discord.js'
import * as configs from '../config/config.mjs'

const name = 'ready'

/**
 * Funcion principal
 * @param {discord.Client} client 
 */
async function main(client) {
    client.user.setPresence({
        status: discord.Status.Idle,
        activities: [{
            name: `@Maple Bot 🍁 | ${configs.__package.version} | Modo prueba y desarrollo`
        }]
    })
    console.info('Cliente iniciado correctamente como', client.user.username)
    await configs.slash_manager(client)
    return 0
}

/**
 * Estadisticas del bot
 * @param {discord.Client} client 
 */
async function stats(client) {
    let totalGuilds, totalMembers
    try {
        let [ guildCount, memberCount ] = await Promise.all([
            client.shard.fetchClientValues('guilds.cache.size'),
            client.shard.broadcastEval(c => c.guilds.cache.reduce((acum, guild) => acum + guild.memberCount, 0))
        ])

        totalGuilds = guildCount.reduce((acc, guildCount) => acc + guildCount, 0)
        totalMembers = memberCount.reduce((acc, memberCount) => acc + memberCount, 0)
    } catch (error) {
        console.error(error)
    }
    return 0
}

export {
    name,
    main
}