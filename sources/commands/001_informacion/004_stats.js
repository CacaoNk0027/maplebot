const discord = require('discord.js')
const models = require('maplebot_models')
const ms = require('ms')
const moment = require('moment')
const node_os = require('node-os-utils')
const os_system = require('os')
const format = require('moment-duration-format')
const configs = require('../../utils/exports')
const { sdk } = require('../../app/body')

format(moment)

/**
 * @param {discord.Client} client
 * @param {discord.Message} message
 * @param {import('../../../typings').args} args
 */
exports.text = async (client, message, args) => {
    try {
        const msg = await message.reply({ content: 'espera a que se carguen las estadisticas :3' });

        let cpu, cpuUsage;
        let promises = [
            client.shard.fetchClientValues('guilds.cache.size'),
            client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
            cpu = node_os.cpu, p1 = cpu.usage().then(cpuPercentage => {
                cpuUsage = cpuPercentage
            })
        ]

        Promise.all(promises).then(async results => {
            const totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0)
            const totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0)
            var mem = node_os.mem
            let freeRAM, usedRAM

            await mem.info().then((info) => {
                freeRAM = info['freeMemMb']
                usedRAM = info['totalMemMb'] - freeRAM
            })

            let votos = (await sdk.getBot(client.user.id)).monthlyPoints

            await msg.edit({
                content: " ",
                embeds: [{
                    author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL()
                    },
                    color: 0xfcf5d4,
                    fields: [{
                        name: "Usuarios | <:Dis_memberList:888232778418749491>",
                        value: `\`\`\`js\n${totalMembers}\n\`\`\``,
                        inline: true
                    }, {
                        name: "Emojis | <a:Disc_wumpusNitro:888314108909338625>",
                        value: `\`\`\`js\n${client.emojis.cache.size}\n\`\`\``,
                        inline: true
                    }, {
                        name: "Canales | <:Dis_channelText:888230498214760509>",
                        value: `\`\`\`js\n${client.channels.cache.size}\n\`\`\``,
                        inline: true
                    }, {
                        name: "Servidores | <:Dis_friends:888233777049010226>",
                        value: `\`\`\`js\n${totalGuilds}\n\`\`\``,
                        inline: true
                    }, {
                        name: "Votos | ❤",
                        value: `\`\`\`js\n${votos}\n\`\`\``,
                        inline: true
                    }, {
                        name: "Rendimiento | <a:Disc_ready:888311653114982400>",
                        value: `\`\`\`\nRAM: ${models.utils.percentageBar(usedRAM, freeRAM, 18)} [${Math.round((100 * usedRAM / (usedRAM + freeRAM)))}%]\nCPU: ${models.utils.percentageBar(cpuUsage, 100 - cpuUsage, 18)} [${Math.round(cpuUsage)}%]\n\`\`\``,
                        inline: false
                    }, {
                        name: "Sistema | <:Dis_bg_employee:888238358118154270>",
                        value: `\`\`\`\nProcesador:\n  ${node_os.cpu.model()}\nSistema Operativo:\n  ${os_system.type} ${os_system.release} ${os_system.arch}\nMemoria RAM:\n  ${Math.floor(Math.ceil(os_system.totalmem() / 1048576) / 1000)} GB\n\`\`\``,
                        inline: false
                        }, { 
                            name: "Tiempo de actividad del bot", 
                            value: `\`\`\`\n${moment.duration(client.uptime).format(`D [Días], H [Horas], m [Minutos], s [Segundos]`)}\n\`\`\``, 
                            inline: true 
                    }]
                }]
            })
        }).catch(console.error)
    } catch (error) {
        console.error(error)
        await models.utils.error(message, error)
    }
}

/**
 * @param {discord.Client} client
 * @param {discord.CommandInteraction} interaction
 */
exports.slash = async (client, interaction) => {
    try {
        await interaction.reply({ content: 'espera a que se carguen las estadisticas :3' });

        let cpu, cpuUsage;
        let promises = [
            client.shard.fetchClientValues('guilds.cache.size'),
            client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
            cpu = node_os.cpu, p1 = cpu.usage().then(cpuPercentage => {
                cpuUsage = cpuPercentage
            })
        ]

        Promise.all(promises).then(async results => {
            const totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0)
            const totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0)
            var mem = node_os.mem
            let freeRAM, usedRAM

            await mem.info().then((info) => {
                freeRAM = info['freeMemMb']
                usedRAM = info['totalMemMb'] - freeRAM
            })

            let votos = (await sdk.getBot(client.user.id)).monthlyPoints

            await interaction.editReply({
                content: " ",
                embeds: [{
                    author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL()
                    },
                    color: 0xfcf5d4,
                    fields: [{
                        name: "Usuarios | <:Dis_memberList:888232778418749491>",
                        value: `\`\`\`js\n${totalMembers}\n\`\`\``,
                        inline: true
                    }, {
                        name: "Emojis | <a:Disc_wumpusNitro:888314108909338625>",
                        value: `\`\`\`js\n${client.emojis.cache.size}\n\`\`\``,
                        inline: true
                    }, {
                        name: "Canales | <:Dis_channelText:888230498214760509>",
                        value: `\`\`\`js\n${client.channels.cache.size}\n\`\`\``,
                        inline: true
                    }, {
                        name: "Servidores | <:Dis_friends:888233777049010226>",
                        value: `\`\`\`js\n${totalGuilds}\n\`\`\``,
                        inline: true
                    }, {
                        name: "Votos | ❤",
                        value: `\`\`\`js\n${votos}\n\`\`\``,
                        inline: true
                    }, {
                        name: "Rendimiento | <a:Disc_ready:888311653114982400>",
                        value: `\`\`\`\nRAM: ${models.utils.percentageBar(usedRAM, freeRAM, 18)} [${Math.round((100 * usedRAM / (usedRAM + freeRAM)))}%]\nCPU: ${models.utils.percentageBar(cpuUsage, 100 - cpuUsage, 18)} [${Math.round(cpuUsage)}%]\n\`\`\``,
                        inline: false
                    }, {
                        name: "Sistema | <:Dis_bg_employee:888238358118154270>",
                        value: `\`\`\`\nProcesador:\n  ${node_os.cpu.model()}\nSistema Operativo:\n  ${os_system.type} ${os_system.release} ${os_system.arch}\nMemoria RAM:\n  ${((os_system.totalmem() / 1048576) / 1000).toFixed(2)} GB\n\`\`\``,
                        inline: false
                    }, {
                        name: "Tiempo de actividad del bot",
                        value: `\`\`\`\n${moment.duration(client.uptime).format(`D [Días], H [Horas], m [Minutos], s [Segundos]`)}\n\`\`\``,
                        inline: true
                    }, {
                        name: "Último Inicio",
                        value: `<t:${moment(client.readyAt).unix()}:F>`,
                        inline: true
                    }]
                }]
            })
        }).catch(console.error)
    } catch (error) {
        console.error(error)
        await configs.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    name: 'stats',
    alias: ['estadisticas'],
    id: '004',
    description: 'muestra mis stats en servidores y host, etc.',
    category: 'informacion',
    options: [],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks'],
    },
    status: {
        code: 1,
        reason: null,
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}