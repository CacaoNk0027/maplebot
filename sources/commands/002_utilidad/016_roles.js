const discord = require('discord.js')
const models = require('maplebot_models')
const ms = require('ms')
const configs = require('../../utils/exports')
const nekoapi = require('cacao_nekoapi')

/**
 * @param {discord.Client} client
 * @param {discord.Message} message
 * @param {import('../../../typings').args} args
 */
exports.text = async (client, message, args) => {
    try {
        let rolesCollection = (await message.guild.roles.fetch()).filter(rol => rol.name !== "@everyone");
        if(rolesCollection.size <= 0) return await message.reply({
            embeds: [{ description: models.utils.statusError('error', "no hay roles en este servidor"), color: 0xff0000 }],
        });
        let totalPages = Math.ceil(rolesCollection.size / 12) || 1

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
                    title: `Lista de roles de ${message.guild.name}`,
                    footer: {
                        text: `Pagina ${(i + 1).toString()}/${totalPages.toString()}`,
                        icon_url: message.guild.iconURL({ forceStatic: false })
                    },
                    description: `${rolesCollection.map(c => c).slice(i * 12, i * 12 + 12).map((ch, int_) => `**#${i * 12 + int_ + 1}** | <@&${ch.id}>`).join('\n')}`,
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
            client.chbnroles_pages.has(msg.id) ? client.chbnroles_pages.delete(msg.id) : false;
        }, ms('5m'));
    } catch (error) {
        console.error(error)
        await models.utils.error(message, error)
    }
}

/**
 * @param {discord.Client} client
 * @param {discord.CommandInteraction} interaction
 */
exports.slash = async (client, interaction) => {
    try {

    } catch (error) {
        console.error(error)
        await configs.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    name: 'roles',
    alias: ['rolelist'],
    id: '016',
    description: 'muestra listas de los roles del servidor',
    category: 'utilidad',
    options: [],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks'],
    },
    status: {
        code: 1,
        reason: null,
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}