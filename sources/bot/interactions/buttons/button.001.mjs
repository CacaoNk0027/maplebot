import * as discord from 'discord.js'
import * as config from '../../config/config.mjs'

const id = 'button.001'
const isUnique = true

/**
 * @param {discord.Client} client 
 * @param {discord.ButtonInteraction} interaction 
 * @param {discord.Message} message
 */
async function main(client, interaction, message) {
    await message.edit({
        embeds: [{
            author: {
                name: client.user.globalName || client.user.username,
                icon_url: client.user.avatarURL()
            },
            color: config.random_color(),
            description: 'Ve la configuracion del comando Welcome (tambien aplica para farewell)',
            fields: [{
                name: 'Sintaxis',
                value: config.code_text(`${await config.prefix(message.guildId)}wlc <opcion> {subopcion} {...argumentos}\n\nrequerido: <*> | requerido solo si se usa: {*}`)
            }, {
                name: 'Opciones',
                value: config.code_text(
                    `<channel> : canal donde se establecera el sistema\n` +
                    `Ejemplo: ${await config.prefix(message.guildId)}wlc #general\n` +
                    `\n<text> : edita los textos de la bienvenida\n` +
                    `\t{msg | desc | tit} : mensaje, descripción y titulo\n` +
                    `\t\t<...args> : texto a establecer en X subopción\n` +
                    `Ejemplo: ${await config.prefix(message.guildId)}wlc text msg hola mundo!\n` +
                    `\n<embed> : tipo de bienvenida\n` +
                    `\t{y | n} : y para embed, default n\n` +
                    `Ejemplo: ${await config.prefix(message.guildId)}wlc embed true\n` +
                    `\n<background> : modifica el fondo\n` +
                    `\t{url | hex} : url a imagen o color hexadecimal\n` +
                    `Ejemplo: ${await config.prefix(message.guildId)}wlc background #fff\n` +
                    `\n<color> : cambia los colores de la imagen\n` +
                    `\t{desc | tit | border} : descripción, titulo y borde\n` +
                    `\t\t<hex> : color hexadecimal de X subopción\n` +
                    `Ejemplo: ${await config.prefix(message.guildId)}wlc color tit #000\n`+
                    `\n<test> : genera una vista previa de la bienvenida`
                    , 'html')
            }, {
                name: 'Formateadores',
                value: config.code_text(`Los formateadores sirven para añadir cosas a los textos\n{user} : añade el nombre de usuario nuevo\n{mention} : menciona al usuario\n{server} : añade el nombre del servidor\n{count} : conteo de personas en el server`)
            }]
        }],
        components: [{
            type: discord.ComponentType.ActionRow,
            components: [{
                type: discord.ComponentType.Button,
                custom_id: 'button.001',
                label: 'Ayuda',
                emoji: '📄',
                style: discord.ButtonStyle.Secondary,
                disabled: true
            }]
        }]
    }).then(async () => {
        await interaction.deferUpdate()
    }).catch(async error => {
        console.error(error)
        await interaction.reply({
            content: 'Ha ocurrido un error interno al editar el mensaje, comunicate con el desarrollador',
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