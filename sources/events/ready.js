// importaciones

require('dotenv').config()
const discord = require('discord.js')
const models = require('maplebot_models')
const package_json = require('../../package.json')
const config = require('../utils/exports.js')
const { sdk } = require('../app/body')
const axios = require('axios')
const { SlashManager } = require('../utils/slashCommandManager')
const Webhook = new discord.WebhookClient({
    id: process.env['eventsId'],
    token: process.env['eventsToken']
})

// exportacion de arreglo con nombre y funcion del evento

exports.event = {
    // nombre
    name: "ready",
    /**
     * funcion principal para la ejecicion del evento
     * @param {discord.Client} client 
     */
    exec: async (client) => {
        client.user.setPresence({
            status: 'online',
            activities: [{
                name: `@Maple bot 🍁 | ${package_json.version} | ${config._random(await config.presences(client))}`
            }]
        })
        let interactions_length = await SlashManager(client);
        console.info("total de comandos de texto cargados:", client.comandos.size)
        console.info(`El cliente se ha iniciado correctamente como: ${client.user.username}`)
        try {
            const promises = [
                client.shard.fetchClientValues('guilds.cache.size'),
                client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
                (await sdk.getBot("821452429409124451")),
                (await sdk.getStats("821452429409124451"))
            ]
            let results = await Promise.all(promises);
            let totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
            let totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0);
            let topgg_client = results[2];
            let topgg_stats = results[3];
            await Webhook.send({
                embeds: [{
                    author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL({ extension: 'png', size: 512 })
                    },
                    description: 'Me he vuelo a iniciar correctamente con... <:006:1012749025398759425>',
                    title: 'Reinicio de la bot',
                    color: config.randomColor(),
                    timestamp: new Date(),
                    fields: [{
                        name: 'Estadisticas',
                        value: `${config.menus.stats({
                            servers: totalGuilds,
                            interactions: interactions_length,
                            commands: client.comandos.size,
                            users: totalMembers,
                            votos: (topgg_client.monthlyPoints),
                            shards: (topgg_stats.shardCount)
                        })}`
                    }]
                }]
            })
            await axios.default.post('https://nekoapi.vanillank2006.repl.co/api/post/', {
                clientId: "821452429409124451",
                clientGuilds: totalGuilds,
                clientMembers: totalMembers,
                clientVotes: topgg_client.monthlyPoints,
                clientCommands: client.comandos
            }).catch(error => error)
            await client.channels.cache.get('863902846294163490').setName(`⌠🔔 servers⌡: ${totalGuilds}`)
        } catch (error) {
            console.error(error)
        }
    }
}