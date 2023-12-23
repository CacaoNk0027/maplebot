const discord = require('discord.js')

const config = require('../../utils/exports')
const nekoapi_1 = require('cacao_nekoapi')
const nekoapi_2 = require('nekoapi.beta')
const mongo = require('mongoose')
const Canvas = require('canvas')

/**
 * @param {discord.Client} client
 * @param {discord.ButtonInteraction} interaction
 */
exports.exec = async (client, interaction) => {
    try {
        let prefix; try {
            prefix = (await config.schemas.SetPrefix.findOne({ guildID: interaction.guildId }).exec()).prefix;
        } catch (error) { prefix = 'sin prefix personalizado' };
        await interaction.reply({
            embeds: [{
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL()
                },
                color: 0xff0000,
                description: `<:mkMaple_peek:836369972313718795>veo que buscas mas información curiosillo, bien aqui tienes la demas información`,
                fields: [{
                    name: "Prefixes",
                    value: `❗ Preterminados: **m!**, **\<@${client.user.id}>**\n❓ Personalizado **${prefix}**`,
                }, {
                    name: "Enlaces",
                    value: "🔔 **[Link del servidor de soporte](https://discord.gg/PKGhvUKaQN)**\n💝 **[Link de invitación](https://discord.com/oauth2/authorize?client_id=821452429409124451&scope=bot%20applications.commands&permissions=1238029429974)**\n🌐 **[Sitio web](https://webmaplebotml.herokuapp.com)**"
                }, {
                    name: "Entorno/Programas/Lenguaje/Frameworks",
                    value: `\`\`\`js\n- node.js [${process.version.replace(/v/, "")}] - JavaScript [ES6]\n- npmjs   [9.2.0] - VSCode    [1.74.2]\n\`\`\``
                }, {
                    name: "Paquetes iniciales",
                    value: `\`\`\`js\n- discord.js   [${discord.version}] - cacao_nekoapi [${nekoapi_1.version}]\n- nekoapi.beta [${nekoapi_2.version}]  - mongoose      [${mongo.version}]\n- Canvas      [${Canvas.version}]\n\`\`\``
                }],
                footer: {
                    text: `requerido por ${interaction.user.username}`,
                    icon_url: interaction.user.avatarURL({ forceStatic: false })
                },
                title: `Sobre mi ^^`,
                image: { url: "https://cdn.discordapp.com/attachments/809089744574611507/1009840815624949770/maple_bot.gif" }
            }],
            ephemeral: true
        })
    } catch (error) {
        await config.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    customId: "botinfo",
    status: {
        code: 1,
        reason: null
    }
}