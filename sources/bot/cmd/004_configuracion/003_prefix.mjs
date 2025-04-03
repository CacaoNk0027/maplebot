import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const name = 'prefix'
const id = '003'

let help = {
    alias: ['prefijo'],
    description: 'Establece un prefix para el servidor',
    category: '004',
    options: [{
        name: 'prefix',
        alias: [],
        description: 'Prefijo a establecer',
        required: false,
        options: []
    }],
    permissions: {
        bot: [],
        user: [discord.PermissionFlagsBits.ManageGuild]
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
    let new_doc = null
    let server_db = await config.Prefix.findOne({ guildId: message.guildId })
    if (!args[0]) {
        await message.reply({
            embeds: [{
                color: config.random_color(),
                description: `Si deseas establecer un prefix utiliza \`${(await config.prefix(message.guildId))}\`prefix <prefix>`,
                fields: [{
                    name: '<:supportCommands:1262143719033929820> | Prefix actual',
                    value: `**${(await config.prefix(message.guildId))}** <comando> [argumentos...]`
                }],
                footer: {
                    text: 'prefix de servidor',
                    icon_url: message.guild.iconURL({ forceStatic: false })
                }
            }]
        })
        return 0
    }

    if (args[0].length > 4) {
        await message.reply({
            embeds: [{
                color: discord.Colors.Red,
                description: 'La longitud maxima para un prefijo debe ser de cuatro letras.'
            }]
        })
        return 1
    }

    try {

        if (args[0].toLowerCase() == 'm!' && !server_db) {
            await message.reply({
                embeds: [{
                    color: discord.Colors.Red,
                    description: `No puedes establecer m! como prefijo personalizado`
                }]
            })
            return 1
        }

        if (!server_db) {
            new_doc = new config.Prefix({
                guildId: message.guildId,
                prefix: args[0]
            })
            await new_doc.save()
        } else {
            if (server_db.comparePrefix(args[0])) {
                await message.reply({
                    embeds: [{
                        color: discord.Colors.Red,
                        description: `El prefijo es exactamente igual al actual`
                    }]
                })
                return 1
            }

            if (args[0].toLowerCase() == 'm!') {
                await config.Prefix.deleteOne({ guildId: message.guildId })
                await message.reply({
                    embeds: [{
                        color: discord.Colors.Green,
                        description: `Se ha eliminado el prefijo actual y se ha reestablecido al preterminado <:007:1012749027508498512>`
                    }]
                })
                return 0
            }

            server_db.prefix = args[0]
            await server_db.save()
        }

        await message.reply({
            embeds: [{
                color: discord.Colors.Green,
                description: `A partir de ahora respondere al prefijo **${args[0]}** <:007:1012749027508498512>`
            }]
        })
    } catch (error) {
        console.error(error)
        await message.reply({
            embeds: [{
                color: discord.Colors.Green,
                description: `Fallo al establecer **${args[0]}** como prefijo`
            }]
        })
    }

    return 0
}

/**
 * @param {discord.Client} client
 * @param {discord.CommandInteraction} interaction
 */
async function slash(client, interaction) {
    return 0
}

export {
    name,
    id,
    help,
    main,
    slash
}