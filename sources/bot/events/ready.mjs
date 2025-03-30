import * as discord from 'discord.js'
import * as configs from '../config/config.mjs'
import sdk from '@top-gg/sdk'

const topApi = new sdk.Api(process.env.TOPGG_TOKEN)
const webhook = new discord.WebhookClient({
    url: process.env.EVENTS_WEBHOOK
})

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
    await stats(client)
    return 0
}

/**
 * Estadisticas del bot
 * @param {discord.Client} client 
 */
async function stats(client) {
    let totalGuilds, totalMembers
    let votes
    try {
        let [ guildCount, memberCount ] = await Promise.all([
            client.shard.fetchClientValues('guilds.cache.size'),
            client.shard.broadcastEval(c => c.guilds.cache.reduce((acum, guild) => acum + guild.memberCount, 0))
        ])

        totalGuilds = guildCount.reduce((acc, guildCount) => acc + guildCount, 0)
        totalMembers = memberCount.reduce((acc, memberCount) => acc + memberCount, 0)
        votes = await topApi.getVotes(client.user.id)

    } catch (error) {
        console.error(error)
    }

    (await client.channels.fetch("1147811856749166703")).setName(`Servidores 🌐『 ${totalGuilds} 』`)

    webhook.send({
        embeds: [{
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL({ forceStatic: false })
            },
            title: "Inicio / Reinicio de la bot iniciado",
            color: configs.random_color(),
            description: configs.code_text(`+ Status activa\n>> [${client.cmds.size}] comandos totales\n>> [${totalGuilds}] Servidores\n>> [${totalMembers}] Usuarios`, 'diff')
        }]
    })

    return 0
}

export {
    name,
    main
}