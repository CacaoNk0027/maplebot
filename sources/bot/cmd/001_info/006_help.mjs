import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const name = 'help'
const id = '006'

let help = {
    alias: ['ayuda', 'h'],
    description: 'Genera un menu de ayuda en el cual podras ver la lista de comandos de cada categoria',
    category: '001',
    options: [{
        name: 'command',
        alias: [],
        description: 'Escribe un comando para saber acerca del mismo',
        required: false,
        options: []
    }, {
        name: 'category',
        alias: [],
        description: 'Muestra informacion acerca del usuario',
        required: false,
        options: []
    }],
    permissions: {
        user: [],
        bot: []
    },
    inactive: false,
    reason: null,
    nsfw: false,
    cooldown: 5
}

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {string[]} args 
 */
async function main(client, message, args) {
    let identifier = args[0]
    let command;
    if (!identifier) {
        await menus(client, message)
        return 0;
    }
    command = client.cmds.get(identifier) ||
        client.cmds.find(cmd => cmd.id == identifier || cmd.help.alias.includes(identifier))
    if (!command) {
        await menus(client, message)
        return 1;
    }

    await message.reply({
        embeds: [{
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL()
            },
            color: command.help.inactive ? discord.Colors.Red : config.theme_color,
            description: command.help.description,
            fields: [{
                name: 'Alias',
                value: config.code_text(command.help.alias.join(', ') || 'Sin alias')
            }, {
                name: 'Categoria',
                value: config.code_text(config.help_menu.find(c => c.id == command.help.category).name),
                inline: true
            }, {
                name: 'Filtro nsfw',
                value: config.code_text(command.help.nsfw ? '- Activo' : '+ Inactivo', 'diff'),
                inline: true
            }, {
                name: 'Cooldown',
                value: config.code_text(`${command.help.cooldown} segundos`, 'js'),
                inline: true
            }, {
                name: 'Estado',
                value: config.code_text(`Operación: ${command.help.inactive ? `[🔴] Comando inactivo\nRazón: ${command.help.reason || 'No se especifico motivo'}` : '[🟢] operando con normalidad'}`)
            }],
            footer: {
                text: `ID | ${command.id}`
            },
            title: `Comando | ${client.cmds.filter(cmd => cmd.id == command.id).map((cmd, n) => n).join('')}`
        }],
        components: [{
            type: discord.ComponentType.ActionRow,
            components: [{
                type: discord.ComponentType.StringSelect,
                custom_id: 'menu.002',
                placeholder: 'Opciones',
                options: [{
                    label: 'Parametros generales',
                    value: '001',
                    description: 'Alias, cooldown, estado, entre otros.',
                    emoji: '📄'
                }, {
                    label: 'Parametros especificos',
                    value: '002',
                    description: 'Opciones y permisos.',
                    emoji: '📍'
                }]
            }]
        }]
    })
    return 0
}

/**
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
async function slash(client, interaction) {
    let identifier = interaction.options?.get('comando')?.value
    let command;
    if (!identifier) {
        await menus(client, interaction)
        return 0;
    }
    command = client.cmds.get(identifier) ||
        client.cmds.find(cmd => cmd.id == identifier || cmd.help.alias.includes(identifier))
    if (!command) {
        await menus(client, interaction)
        return 1;
    }

    await interaction.reply({
        embeds: [{
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL()
            },
            color: command.help.inactive ? discord.Colors.Red : config.theme_color,
            description: command.help.description,
            fields: [{
                name: 'Alias',
                value: config.code_text(command.help.alias.join(', ') || 'Sin alias')
            }, {
                name: 'Categoria',
                value: config.code_text(config.help_menu.find(c => c.id == command.help.category).name),
                inline: true
            }, {
                name: 'Filtro nsfw',
                value: config.code_text(command.help.nsfw ? '- Activo' : '+ Inactivo', 'diff'),
                inline: true
            }, {
                name: 'Cooldown',
                value: config.code_text(`${command.help.cooldown} segundos`, 'js'),
                inline: true
            }, {
                name: 'Estado',
                value: config.code_text(`Operación: ${command.help.inactive ? `[🔴] Comando inactivo\nRazón: ${command.help.reason || 'No se especifico motivo'}` : '[🟢] operando con normalidad'}`)
            }],
            footer: {
                text: `ID | ${command.id}`
            },
            title: `Comando | ${client.cmds.filter(cmd => cmd.id == command.id).map((cmd, n) => n).join('')}`
        }],
        components: [{
            type: discord.ComponentType.ActionRow,
            components: [{
                type: discord.ComponentType.StringSelect,
                custom_id: 'menu.002',
                placeholder: 'Opciones',
                options: [{
                    label: 'Parametros generales',
                    value: '001',
                    description: 'Alias, cooldown, estado, entre otros.',
                    emoji: '📄'
                }, {
                    label: 'Parametros especificos',
                    value: '002',
                    description: 'Opciones y permisos.',
                    emoji: '📍'
                }]
            }]
        }]
    })
    return 0
}

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 */
async function menus(client, message) {
    await message.reply({
        embeds: [{
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL({ forceStatic: false })
            },
            color: config.theme_color,
            description: 'Selecciona una de las categorias del menu desplegable',
            fields: [{
                name: '<:staff:1262144147687477310> | Soporte',
                value: `Si requieres algun tipo de ayuda especial, únete a mi [servidor de soporte](https://discord.gg/E3kzS5cYzN)`
            }],
            title: `<:007:1012749027508498512> | Menu de ayuda`
        }],
        components: [{
            type: discord.ComponentType.ActionRow,
            components: [{
                type: discord.ComponentType.StringSelect,
                custom_id: 'menu.001',
                placeholder: 'Categorias',
                options: config.help_menu_options()
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