import * as discord from 'discord.js'
import * as config from './sources/bot/config/config.mjs'

const name = 'server'
const id = '004'

let help = {
    alias: ['serverinfo', 'servidor', 'sv'],
    description: 'obten informacion del servidor, asi como su icono, su banner, entre otros.',
    category: '001',
    options: [{
        name: 'info',
        alias: ['informacion', 'in'],
        description: 'muestra informacion del servidor',
        required: false
    }, {
        name: 'icon',
        alias: ['icono', 'imagen', 'im'],
        description: 'muestra el icono del servidor',
        required: false
    }, {
        name: 'banner',
        alias: ['fondo', 'background', 'b'],
        description: 'muestra el banner del servidor',
        required: false
    }],
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
    let identifier = args[0]
    try {
        if(help.options[0].alias.includes(identifier) || !identifier) {
            await info(message)
        } else
        if(help.options[1].alias.includes(identifier)) {
            await icon(message)
        } else
        if(help.options[2].alias.includes(identifier)) {
            await banner(message)
        }
    } catch (error) {
        console.error(error)
        await message.reply({
            embeds: [{
                author: {
                    name: 'Error',
                    icon_url: client.user.avatarURL({ forceStatic: false })
                },
                color: discord.Colors.Red,
                description: '> No se ha podido cargar el comando debido a un error interno.'
            }]
        })
    }
    return 0;
}

/**
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
async function slash(client, interaction) {
    let identifier;
    if(!interaction.guild) {
        await interaction.reply({
            embeds: [{
                author: {
                    name: 'Advertencia',
                    icon_url: client.user.avatarURL({ forceStatic: false })
                },
                color: discord.Colors.Orange,
                description: '> Este comando solo puede ser usado en servidores'
            }],
            ephemeral: true
        })
        return 0
    }

    try {
        identifier = interaction.options.getSubcommand()
        
        switch(identifier) {
            case 'info':
                await info(interaction)
                break
            case 'icono':
                await icon(interaction)
                break
            case 'banner':
                await banner(interaction)
                break
            default:
                await info(interaction)
        }
    } catch(error) {
        console.error(error)
        await interaction.reply({
            embeds: [{
                author: {
                    name: 'Error',
                    icon_url: client.user.avatarURL({ forceStatic: false })
                },
                color: discord.Colors.Red,
                description: '> No se ha podido cargar el comando debido a un error interno.'
            }],
            ephemeral: true
        })
    }
}

/**
 * @param {discord.Message} target  
 */
async function info(target) {
    let guild, owner, members, bots
    guild = await target.guild.fetch()
    owner = await guild.fetchOwner()
    members = guild.members.cache.filter(member => !member.user.bot).size;
    bots = guild.members.cache.filter(member => member.user.bot).size;

    await target.reply({
        embeds: [{
            author: {
                name: `Owner 👑 | ${owner.user.username}`,
                icon_url: owner.user.avatarURL({ forceStatic: false })
            },
            color: config.random_color(),
            thumbnail: {
                url: guild.iconURL({ forceStatic: false })
            },
            description: guild.description || 'Sin descripcion de servidor...',
            title: guild.name,
            fields: [{
                name: '<a:Disc_ready:888311653114982400> | Fecha de creación',
                value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`
            },{
                name: '<:newmember:1262144151844028537> | Usuarios',
                value: config.code_text(`Miembros [${members}]\nBots [${bots}]\nTotales [${members+bots}]`),
                inline: true
            }, {
                name: '<:Dis_channelText:888230498214760509> | Canales',
                value: config.code_text(`Categorias [${guild.channels.cache.filter(channel => channel.type == discord.ChannelType.GuildCategory)}]\mTexto [${guild.channels.cache.filter(channel => channel.type == discord.ChannelType.GuildText)}]\nVoz [${guild.channels.cache.filter(channel => channel.type == discord.ChannelType.GuildVoice)}]`)
            }]
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