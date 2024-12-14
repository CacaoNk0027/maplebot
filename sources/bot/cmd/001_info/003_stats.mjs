import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'
import os from 'systeminformation'

const name = 'stats'
const id = '003'

let help = {    
    alias: ['estadisticas', 'metricas', 'sts'],
    description: 'Checa estadísticas como el uso de ram, uso de cpu, etc',
    category: '001',
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
    let reply, embed
    let totalGuilds, totalMembers
    let network, cpu, ram
    let mem

    reply = await message.reply({
        embeds: [{
            description: '> <:004:1012749020852133918> | Espera en lo que las estadísticas cargan...',
            color: discord.Colors.Yellow
        }] 
    })

    try {
        let [ guildCount, memberCount ] = await Promise.all([
            client.shard.fetchClientValues('guilds.cache.size'),
            client.shard.broadcastEval(c => c.guilds.cache.reduce((acum, guild) => acum + guild.memberCount, 0))
        ])

        totalGuilds = guildCount.reduce((acum, guildCount) => acum + guildCount, 0)
        totalMembers = memberCount.reduce((acum, memberCount) => acum + memberCount, 0)
        network = (await os.networkStats())[0]
        cpu = (await os.currentLoad()).currentLoad.toFixed(2)
        mem = (await os.mem())
        used = mem.total - mem.available
        ram = ((used / mem.total) * 100).toFixed(2)
    } catch(error) {
        console.error(error)
        reply.edit({
            embeds: [{
                description: '> <:002:1012749017798688878> | ha sucedido un error al tratar de conseguir las estadísticas',
                color: discord.Colors.Red
            }]
        })
        return 0
    }

    embed = new discord.EmbedBuilder({
        author: {
            name: client.user.username,
            icon_url: client.user.avatarURL({ forceStatic: false })
        },
        color: config.theme_color,
        description: 'Estadísticas cargadas <:007:1012749027508498512>',
        fields: [{
            name: 'Usuarios | <:newmember:1262144151844028537>',
            value: config.code_text(`+ ${totalMembers}`, 'diff'),
            inline: true
        }, {
            name: 'Servidores | <:partner:1262143727669874761>',
            value: config.code_text(`+ ${totalGuilds}`, 'diff'),
            inline: true
        }, {
            name: 'Canales | 📺',
            value: config.code_text(`+ ${client.channels.cache.size}`, 'diff')
        }, {
            name: 'Comandos | ❗',
            value: config.code_text(`+ ${client.cmds.size}`, 'diff'),
            inline: true
        }, {
            name: 'Interacciones | <:supportCommands:1262143719033929820>',
            value: config.code_text(`+ ${client.application?.commands.cache.size}`, 'diff'),
            inline: true
        }, {
            name: 'Uso de red | 🛜',
            value: config.code_text(`↑ ${(network.tx_bytes/(1024 * 1024)).toFixed(2)} MB - ↓ ${(network.rx_bytes/(1024 * 1024)).toFixed(2)} MB`)
        }, {
            name: 'Sistema | <:005:1012749024220155964>',
            value: config.code_text(`CPU | [${config.por_barra(cpu, 15)}] ${cpu}%\nRAM | [${config.por_barra(ram, 15)}] ${ram}%`)
        }],
        thumbnail: {
            url: 'https://media1.tenor.com/m/2b0p_yrMJeoAAAAd/nekopara-maple.gif'
        }
    })

    await reply.edit({
        embeds: [embed]
    })
    return 0
}

async function slash(client, interaction) {
    let reply, embed
    let totalGuilds, totalMembers
    let network, cpu, ram
    let mem, used

    reply = await interaction.reply({
        embeds: [{
            description: '> <:004:1012749020852133918> | Espera en lo que las estadísticas cargan...',
            color: discord.Colors.Yellow
        }] 
    })

    try {
        let [ guildCount, memberCount ] = await Promise.all([
            client.shard.fetchClientValues('guilds.cache.size'),
            client.shard.broadcastEval(c => c.guilds.cache.reduce((acum, guild) => acum + guild.memberCount, 0))
        ])

        totalGuilds = guildCount.reduce((acum, guildCount) => acum + guildCount, 0)
        totalMembers = memberCount.reduce((acum, memberCount) => acum + memberCount, 0)
        network = (await os.networkStats())[0]
        cpu = (await os.currentLoad()).currentLoad.toFixed(2)
        mem = (await os.mem())
        used = mem.total - mem.available
        ram = ((used / mem.total) * 100).toFixed(2)
    } catch(error) {
        console.error(error)
        reply.edit({
            embeds: [{
                description: '> <:002:1012749017798688878> | ha sucedido un error al tratar de conseguir las estadísticas',
                color: discord.Colors.Red
            }]
        })
        return 0
    }

    embed = new discord.EmbedBuilder({
        author: {
            name: client.user.username,
            icon_url: client.user.avatarURL({ forceStatic: false })
        },
        color: config.theme_color,
        description: 'Estadísticas cargadas <:007:1012749027508498512>',
        fields: [{
            name: 'Usuarios | <:newmember:1262144151844028537>',
            value: config.code_text(`+ ${totalMembers}`, 'diff'),
            inline: true
        }, {
            name: 'Servidores | <:partner:1262143727669874761>',
            value: config.code_text(`+ ${totalGuilds}`, 'diff'),
            inline: true
        }, {
            name: 'Canales | 📺',
            value: config.code_text(`+ ${client.channels.cache.size}`, 'diff')
        }, {
            name: 'Comandos | ❗',
            value: config.code_text(`+ ${client.cmds.size}`, 'diff'),
            inline: true
        }, {
            name: 'Interacciones | <:supportCommands:1262143719033929820>',
            value: config.code_text(`+ ${client.application?.commands.cache.size}`, 'diff'),
            inline: true
        }, {
            name: 'Uso de red | 🛜',
            value: config.code_text(`↑ ${(network.tx_bytes/(1024 * 1024)).toFixed(2)} MB - ↓ ${(network.rx_bytes/(1024 * 1024)).toFixed(2)} MB`)
        }, {
            name: 'Sistema | <:005:1012749024220155964>',
            value: config.code_text(`CPU | [${config.por_barra(cpu, 15)}] ${cpu}%\nRAM | [${config.por_barra(ram, 15)}] ${ram}%`)
        }],
        thumbnail: {
            url: 'https://media1.tenor.com/m/2b0p_yrMJeoAAAAd/nekopara-maple.gif'
        }
    })

    await reply.edit({
        embeds: [embed]
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