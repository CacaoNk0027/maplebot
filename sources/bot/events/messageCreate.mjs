import * as discord from 'discord.js'
import * as configs from '../config/config.mjs'
import * as server from '../_support/message.mjs'

const name = 'messageCreate'

let cooldown = new discord.Collection()
let warnings = new discord.Collection()

/**
 * evento messageCreate
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 */
async function main(client, message) {
    let args, command, identifier, permissions
    let timeNow, timeStamps, cooldownAmount, expirationTime
    let timeLeft

    permissions = [...configs.default_client_permissions]

    permissions = permissions.filter(
        permission => !message.guild.members.me.permissions.has(permission)
    )

    // condicionales principales
    if (message.author.bot) return 1
    if (message.channel.type == discord.ChannelType.DM) return 1
    if (!message.content.toLowerCase().startsWith(configs.prefix)) return 1
    if (permissions.length > 0) return 1

    args = message.content.slice(configs.prefix.length).trim().split(/ +/g)

    server.main(client, message);

    identifier = args.shift().toLowerCase()

    command = client.cmds.get(identifier) ||
        client.cmds.find(cmd => cmd.id == identifier || cmd.help.alias.includes(identifier))

    // valida comando
    if (!command) return 1

    // valida permiso de desarrollador
    if(command.id.split('_')[0].toLowerCase() == "dev" && !configs.allowed_id(message.author.id)) return 1

    // condicionales asociadas al help

    // valida si el comando esta inactivo
    if (command.help.inactive && !configs.allowed_id(message.author.id)) {
        await message.reply({
            content: `> Este comando esta inactivo a razon: \n\`\`\`\n${command.help.reason}\n\`\`\`\n`
        })
        return 1
    }

    // valida nsfw
    if (command.help.nsfw && !message.channel.nsfw) {
        await message.reply({
            content: `> Este comando necesita ser ejecutado en un canal nsfw`
        })
        return 1
    }

    // valida los permisos del bot dentro del comando
    permissions = [...command.help.permissions.bot]

    permissions = permissions.filter(
        permission => !message.guild.members.me.permissions.has(permission)
    )

    if (permissions.length > 0) {
        permissions = permissions.map(permission =>
            Object.keys(discord.PermissionFlagsBits).find(key =>
                discord.PermissionFlagsBits[key] == permission
            )
        ).join('\n')
        await message.reply({
            content: `Requiero de los siguentes permisos para ejecutar este comando:\n\`\`\`\n${permissions}\n\`\`\`\n`
        })
        return 1
    }

    // valida los permisos del usuario dentro del comando
    permissions = [...command.help.permissions.user]

    permissions = permissions.filter(
        permission => !message.member.permissions.has(permission)
    )

    if (permissions.length > 0) {
        permissions = permissions.map(permission =>
            Object.keys(discord.PermissionFlagsBits).find(key =>
                discord.PermissionFlagsBits[key] == permission
            )
        ).join('\n')
        await message.reply({
            content: `No puedes ejecutar este comando sin los siguentes permisos:\n\`\`\`\n${permissions}\n\`\`\`\n`
        })
        return 1
    }

    // cooldowns
    if (!cooldown.has(identifier)) {
        cooldown.set(identifier, new discord.Collection());
    }

    timeNow = Date.now()
    timeStamps = cooldown.get(identifier)
    cooldownAmount = command.help.cooldown * 1000

    if (timeStamps.has(message.author.id)) {
        expirationTime = timeStamps.get(message.author.id) + cooldownAmount

        if (timeNow < expirationTime) {

            if (warnings.has(message.author.id)) return 1

            timeLeft = expirationTime - timeNow

            await message.reply({
                content: `Usa este comando <t:${Math.floor(expirationTime / 1000)}:R>`
            }).then(msg => {
                setTimeout(async () => {
                    await msg.delete().catch(console.error)
                }, timeLeft >= 5000 ? 5000 : timeLeft - 1000)
            })

            warnings.set(message.author.id, timeLeft >= 5000 ? 5000 : timeLeft);
            setTimeout(() => warnings.delete(message.author.id), timeLeft >= 5000 ? 5000 : timeLeft);

            return 1
        }
    }

    timeStamps.set(message.author.id, timeNow)
    setTimeout(() => timeStamps.delete(message.author.id), cooldownAmount);

    await command.exec.text(client, message, args)

    return 0
}

export {
    name,
    main
}