import * as discord from 'discord.js'
import * as fs from 'fs'

const client = new discord.Client({
    intents: 33283,
    allowedMentions: {
        repliedUser: false
    }
})

client.login(process.env.TOKEN)

client.cmds = new discord.Collection()

fs.readdirSync('sources/bot/events').filter(file => file.endsWith('mjs')).forEach(async file => {
    let event = await import(`./events/${file}`)
    try {
        client.on(event.name, async(...args) => await event.main(client, ...args))
    } catch (error) {
        console.error(error)
    }
})

fs.readdirSync('sources/bot/cmd').forEach(dir => {
    fs.readdirSync(`sources/bot/cmd/${dir}`).filter(file => file.endsWith('mjs')).forEach(async file => {
        let command = await import(`./cmd/${dir}/${file}`)
        try {
            client.cmds.set(command.name, {
                id: `${command.help.category}.${command.id}`,
                help: command.help,
                exec: {
                    text: command.main,
                    slash: command.slash
                }
            })
        } catch (error) {
            console.error(error)
        }
    })
})

process.on('unhandledRejection', (error) => {
    console.log(error)
})

process.on('uncaughtException', (error) => {
    console.log(error)
})