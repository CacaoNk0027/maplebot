import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'
import moment from 'moment'
import format from 'moment-duration-format'

format(moment);

const name = "infobot"
const id = "002"

let help = {
    alias: ["botinfo", "maplebot", "maple", "bot"],
    description: "aprende mas cosas sobre la bot",
    category: "001",
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
 * comando help
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {string[]} args
 */
async function main(client, message, args) {
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
        return 0;
    }
    await message.reply({
        embeds: [{
            title: 'Información :heart:', 
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL({ forceStatic: false })
            },
            color: config.theme_color,
            description: `Hola! Soy **${client.user.username}**, trabajo siendo una bot multiusos. Soy buena en lo que me gusta, **moderacion y roleplay** aun asi, trato de mejorar, aunque aveces me cuestione ciertas cosas...`,
            fields: [{
                name: 'Sobre mi 🔎',
                value: `Creador | kmz_kuro\nCreacion: <t:${Math.floor(client.application.createdTimestamp/1000)}:F>\nID | ${client.user.id}\nVersión: ${config.__package.version}`,
            }, {
                name: 'Estadisticas 📊',
                value: `Servidores | ${totalGuilds}\nUsuarios | ${totalMembers}\nComandos | **${client.cmds.filter(cmd => cmd.help.inactive == false).size}** activos, **${client.cmds.filter(cmd => cmd.help.inactive == true).size}** inactivos\nTiempo al aire | \`${moment.duration(client.uptime).format('D [días] H [horas] m [minutos] s [segundos]')}\``,
                inline: true
            }, {
                name: 'Datos especificos 📍',
                value: `Libreria | Discord.js ^${discord.version}\nLenguaje | Javascript\nRepositorio | [Github.com](https://github.com/CacaoNk0027/maplebot)\nPagina web | (no aplica)`,
                inline: true
            }],
            thumbnail: {
                url: 'https://media1.tenor.com/m/2b0p_yrMJeoAAAAd/nekopara-maple.gif'
            }
        }]
    })
    return 0
}

async function slash(client, interaction) {
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
        return 0;
    }
    await interaction.reply({
        embeds: [{
            title: 'Información :heart:', 
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL({ forceStatic: false })
            },
            color: config.theme_color,
            description: `Hola! Soy **${client.user.username}**, trabajo siendo una bot multiusos. Soy buena en lo que me gusta, **moderacion y roleplay** aun asi, trato de mejorar, aunque aveces me cuestione ciertas cosas...`,
            fields: [{
                name: 'Sobre mi 🔎',
                value: `Creador | kmz_kurom\nCreacion: <t:${Math.floor(client.application.createdTimestamp/1000)}:F>\nID | ${client.user.id}\nVersión: ${config.__package.version}`,
            }, {
                name: 'Estadisticas 📊',
                value: `Servidores | ${totalGuilds}\nUsuarios | ${totalMembers}\nComandos | **${client.cmds.filter(cmd => cmd.help.inactive == false).size}** activos, **${client.cmds.filter(cmd => cmd.help.inactive == true).size}** inactivos\nTiempo al aire | \`${moment.duration(client.uptime).format('D [días] H [horas] m [minutos] s [segundos]')}\``,
                inline: true
            }, {
                name: 'Datos especificos 📍',
                value: `Libreria | Discord.js ^${discord.version}\nLenguaje | Javascript\nRepositorio | [Github.com](https://github.com/CacaoNk0027/maplebot)\nPagina web | (no aplica)`,
                inline: true
            }],
            thumbnail: {
                url: 'https://media1.tenor.com/m/2b0p_yrMJeoAAAAd/nekopara-maple.gif'
            }
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