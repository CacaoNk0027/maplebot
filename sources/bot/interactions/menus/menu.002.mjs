import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const id = 'menu.002'
const isUnique = true
/**
 * @param {discord.Client} client 
 * @param {discord.AnySelectMenuInteraction} interaction 
 * @param {discord.Message} message
 */
async function main(client, interaction, message) {
    let identifier = interaction.values.shift()
    let embed = new discord.EmbedBuilder(message.embeds.shift().data)
    let id = embed.data.footer?.text.match(/\d{3}\.\d{3}/g)[0]
    let command = client.cmds.find(cmd => cmd.id == id)
    let cmd_options = command.help.options.map(option => `${option?.required ? `<${option?.name}> ${option?.description}\n`:`[${option?.name}] ${option?.description}\n`}`)
    let permissions = {
        user: command.help.permissions.user.length > 0 ? command.help.permissions.user.map(permission => permission).join(' '): 'Sin permisos especiales para usuario',
        bot: command.help.permissions.bot.length > 0 ? command.help.permissions.bot.map(permission => permission).join(' '): 'Sin permisos especiales para bot'
    }

    if (identifier == '001') {
        embed.setFields([{
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
        }])
    } else {
        embed.setFields([{
            name: 'Opciones',
            value: config.code_text(cmd_options.length > 0 ? cmd_options.join('') : 'Sin opciones')
        }, {
            name: 'Permisos',
            value: config.code_text(`+ Permisos sobre usuario\n${permissions.user}\n+ Permisos sobre la bot\n${permissions.bot}`, 'diff')
        }])
    }

    await message.edit({
        embeds: [embed]
    }).then(async () => {
        await interaction.deferUpdate()
    }).catch(async error => {
        console.error(error)
        await interaction.reply({
            content: 'Ha ocurrido un error interno al editar el menu, comunicate con el desarrollador',
            ephemeral: true
        })
    })

    return 0
}

export {
    id,
    isUnique,
    main
}