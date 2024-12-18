import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const name = 'help'
const id = '006'

let help = {
    alias: ['ayuda', 'h'],
    description: 'Genera un menu de ayuda en el cual podras ver la lista de comandos',
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
        description: 'muestra informacion acerca del usuario',
        required: false,
        options: []
    }],
    permissions: {
        user: [],
        bot: []
    },
    inactive: true,
    reason: "comando en desarrollo",
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
    if(!identifier) {
        await menus(client, message)
        return 0;
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
                custom_id: '001',
                placeholder: 'Categorias',
                options: config.help_menu_options
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