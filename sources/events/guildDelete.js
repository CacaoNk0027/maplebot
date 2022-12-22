require('dotenv').config()
const discord = require('discord.js')
const configs = require('../utils/exports')
const webhook = new discord.WebhookClient({
    id: process.env['eventsId'],
    token: process.env['eventsToken']
})

exports.event = {
    name: 'guildDelete',
    /**
     * @param {discord.Client} client
     * @param {discord.Guild} guild
     */
    exec: async (client, guild) => {
        if(!guild || guild == null) return;
        await webhook.send({
            embeds: [{
                title: 'Servidor eliminado',
                description: 'Me han sacado de un servidor... <:002:1012749017798688878>',
                color: configs.randomColor,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL({ size: 512, extension: 'png' })
                },
                timestamp: new Date(),
                thumbnail: {
                    url: guild.iconURL({ size: 512, extension: 'png' })
                },
                footer: {
                    text: `Ahora estoy en: ${client.guilds.cache.size} servidores`
                },
                provider: {
                    name: '@Maple bot'
                },
                fields: [{
                    name: "datos",
                    value: `Owner | ${await guild.fetchOwner().then(owner => owner.user.username).catch(error => "indefinido")}\nMiembros | ${guild.memberCount}\nId | ${guild.id}\nNombre | ${guild.name}`
                }]
            }]
        })
        try {
		    let statsGuilds = await client.channels.fetch("863902846294163490")
            await statsGuilds.setName(`⌠🔔 servers⌡: ${client.guilds.cache.size}`)
        } catch (err) { console.error(err) }
    }
}