import * as discord from 'discord.js'
import * as config from '../config/config.mjs'

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 */
async function main(client, message) {
    let args, identifier

    if (message.guildId != '1146357424782049282') return 1

    args = message.content.slice((await config.prefix(message.guildId)).length).trim().split(/ +/g)
    identifier = args.shift().toLowerCase()

    if (['verify', 'verime', 'check'].includes(identifier)) {
        await verify(client, message, args)
        return 0
    }
    return 0
}

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {string[]} args 
 */
async function verify(client, message, args) {
    await message.delete()
    if (
        message.member.roles.cache.size <= 0 ||
        !message.member.roles.cache.has('1147817071380541470')
    ) {
        await message.member.roles.add('1147817071380541470')
    }
    return 0
}

export { main }