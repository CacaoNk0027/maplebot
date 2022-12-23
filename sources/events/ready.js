// importaciones

require('dotenv').config()
const discord = require('discord.js')
const models = require('maplebot_models')
const package_json = require('../../package.json')
const configs = require('../utils/exports.js')
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
            status: 'dnd',
            activities: [{
                name: `@Maple bot 🍁 | ${package_json.version} | ${configs._random(await configs.presences(client))}`
            }]
        })
        let interactions_length = await SlashManager(client);
        console.info("total de comandos de texto cargados:", client.comandos.size)
        console.info(`El cliente se ha iniciado correctamente como: ${client.user.username}`)
        try {
            const promises = [
                client.shard.fetchClientValues('guilds.cache.size'),
                client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0))
            ]
            let results = await Promise.all(promises);
            let totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
            let totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0);
            await Webhook.send({
                embeds: [{
                    author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL({ extension: 'png', size: 512 })
                    },
                    description: 'Me he vuelo a iniciar correctamente con... <:006:1012749025398759425>',
                    title: 'Reinicio de la bot',
                    color: configs.randomColor,
                    timestamp: new Date(),
                    fields: [{
                        name: 'Estadisticas',
                        value: `${models.menus.stats({
                            servers: totalGuilds,
                            interactions: interactions_length,
                            commands: client.comandos.size,
                            users: totalMembers,
                            votos: null,
                            shards: null
                        })}`
                    }]
                }]
            })
            await client.channels.cache.get('863902846294163490').setName(`⌠🔔 servers⌡: ${totalGuilds}`)
        } catch (error) {
            console.error(error)
        }
    }
}