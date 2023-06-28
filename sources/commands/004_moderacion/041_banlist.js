const discord = require('discord.js')
const models = require('maplebot_models')
const config = require('../../utils/exports')
const ms = require('ms')


/**
 * @param {discord.Client} client
 * @param {discord.Message} message
 * @param {import('../../../typings').args} args
 */
exports.text = async (client, message, args) => {
    try {
        let bansCollection = (await message.guild.bans.fetch())
        let totalPages = Math.ceil(bansCollection.size / 6) || 1

        let row = new discord.ActionRowBuilder({
            type: 1,
            components: [{
                customId: "arrowLeft", style: 3, label: "«", type: 2, disabled: true
            }, {
                customId: "buttonStop", style: 4, label: "x", type: 2
            }, {
                customId: "arrowRight", style: 3, label: "»", type: 2
            }]
        })

        let pages = []
        for (let i = 0; i < totalPages; i++) {
            pages.push(
                new discord.EmbedBuilder({
                    author: {
                        name: message.author.username,
                        icon_url: message.author.avatarURL({ forceStatic: false })
                    },
                    title: `Lista de baneos de ${message.guild.name}`,
                    footer: {
                        text: `Pagina ${(i + 1).toString()}/${totalPages.toString()}`,
                        icon_url: message.guild.iconURL({ forceStatic: false })
                    },
                    description: `${bansCollection.map(c => c).slice(i * 6, i * 6 + 6).map((ch, int_) => `**#${i * 6 + int_ + 1}** | \`Username\`: ${ch.user.username}\n\`Id\`: ${ch.user.id}`).join('\n')}`,
                    color: 0xfcf5d4
                })
            )
        }
        let index = 0;
        if (pages.length <= 1) {
            row.setComponents([{
                customId: "arrowLeft", style: 3, label: "«", type: 2, disabled: true
            }, {
                customId: "buttonStop", style: 4, label: "x", type: 2, disabled: true
            }, {
                customId: "arrowRight", style: 3, label: "»", type: 2, disabled: true
            }])
        }
        const msg = await message.reply({
            embeds: [pages[index]],
            components: [{
                type: row.data.type,
                components: row.components
            }]
        })
        client.chbnroles_pages.set(msg.id, { index: index + 1, pages })
        setTimeout(async () => {
            await msg.edit({
                components: [{
                    type: 1,
                    components: [{
                        customId: "arrowLeft",
                        style: 3,
                        label: "«",
                        type: 2,
                        disabled: true
                    }, {
                        customId: "buttonStop",
                        style: 4,
                        label: "x",
                        type: 2,
                        disabled: true
                    }, {
                        customId: "arrowRight",
                        style: 3,
                        label: "»",
                        type: 2,
                        disabled: true
                    }]
                }]
            })
            client.chbnroles_pages.has(msg.id) ? client.chbnroles_pages.delete(msg.id): false;
        }, ms('5m'));
    } catch (err) {
        console.error(err)
        await models.utils.error(message, err)
    }
}


/**
 * @param {discord.Client} client
 * @param {discord.CommandInteraction} interaction
 */
exports.slash = async (client, interaction) => {
    try {
        
    } catch (err) {
        console.error(err)
        await config.interactionErrorMsg(interaction, err)
    }
}


exports.help = {
    name: 'banlist',
    alias: [],
    id: '041',
    description: 've una lista de usuarios baneados',
    category: 'moderacion',
    options: [],
    permissions: {
        user: ['BanMembers'],
        bot: ['SendMessages', 'EmbedLinks', 'BanMembers'],
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s')/1000)
}