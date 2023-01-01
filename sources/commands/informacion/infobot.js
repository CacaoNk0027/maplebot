// importaciones

const discord = require('discord.js')
const { args } = require('../../typings/index')
const moment = require('moment')
const package = require('../../../package.json')
const models = require('maplebot_models')
const ms = require('ms')

/**
 * exportacion del comando en text command
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {args} args 
 */
exports.text = async (client, message, args) => {
    try {
        let msg = await message.reply({
            embeds: [{
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL({ extension: 'png', size: 512 })
                },
                color: 0x910f00,
                description: `Hola **${message.author.username}**! <:007:1012749027508498512>\n\n<:001:1012749015969968138> Soy **${client.user.username}**, soy una bot y fui creada por mi maravilloso padre **${(await client.application?.fetch()).owner.tag}** un <t:${moment((await client.application?.fetch()).createdAt).unix()}:F> <:006:1012749025398759425>Actualmente cuento con **${client.comandos.filter(cmd => cmd.help.status.code == 1).size}** comandos activos y **${client.comandos.filter(cmd => cmd.help.status.code = 0).size}** inactivos, lo que en total serian **${client.comandos.size}** registrados en mi :3`,
                fields: [
                    { name: "Desarrolladores y Equipo", value: `<:Dis_bg_verifiedBotDeveloper:888237981830357042> **oficial:** ${(await client.application?.fetch()).owner.tag}\n<:Dis_bg_bugHunter_v1:888238587529793596> **Ayudantes:** 🔹Jim#0001, Friner#9599` },
                    { name: "Info General", value: `🆔 **ID |** ${client.user.id}\n<a:mkDiscord:836435775935086592> **Version |** ${package.version}\n<:mkTengo_frio:832764121523027979> **Lenguaje |** JavaScript` },
                ],
                footer: {
                    text: `requerido por ${message.author.username}`,
                    icon_url: message.author.avatarURL({ forceStatic: false })
                },
                thumbnail: { url: client.user.avatarURL() },
                title: `Sobre mi ^^`,
                image: { url: "https://cdn.discordapp.com/attachments/809089744574611507/1009840815624949770/maple_bot.gif" }
            }],
            components: [{
                type: 1,
                components: [{
                    customId: "botinfo",
                    emoji: "❓",
                    label: "mas información",
                    style: 2,
                    type: 2
                }]
            }]
        })
        setTimeout(async () => {
            await msg.edit({
                components: [{
                    type: 1,
                    components: [{
                        customId: "botinfo",
                        emoji: "❌",
                        label: "interaccion terminada",
                        style: 2,
                        disabled: true,
                        type: 2
                    }]
                }]
            })
        }, ms('60s'))
    } catch (error) {
        await models.utils.error(message, error); console.error(error);
    }
}

/**
 * exportacion del comando en slash command
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {
    try {

    } catch (error) {
        await interactionErrorMsg(interaction, error);
    }
}

/**
 * exportacion del arreglo help
 */
exports.help = {
    // nombre, alias e id del comando
    name: "infobot",
    alias: ["botinfo", "maplebot"],
    id: "003",
    // description y categoria del comando
    description: "aprende mas sobre mi",
    category: "información",
    // opciones y permisos
    options: [],
    permissions: {
        user: [],
        bot: ["SendMessages", "EmbedLinks"],
    },
    // configuraciones ( status, es nsfw?, contiene embeds?, cooldown )
    status: {
        code: 1, // codigo 1 es comando en operacion, codigo 0 es comando desabilitado
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}