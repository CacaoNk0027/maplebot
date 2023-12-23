const discord = require("discord.js")
const models = require("maplebot_models")
const { DeleteNewArrayBlacklist, interactionErrorMsg } = require("../../utils/exports")

/**
 * 
 * @param {discord.Client} client 
 * @param {discord.ButtonInteraction} interaction 
 */
exports.exec = async (client, interaction) => {
    try {
        if (await config.schemas.Blacklist.findOne({ guildID: interaction.guildId }) == null) return await interaction.reply({
            embeds: [{
                description: config.statusError('error', 'este servidor no cuenta con un sistema de blacklist'),
                color: 0xff0000
            }], ephemeral: true
        })
        if (await config.schemas.Blacklist.findOne({ guildID: interaction.guildId }).exec().then(c => c.words.length <= 0)) return await interaction.reply({
            embeds: [{
                description: config.statusError('error', 'no hay palabras establecidas en la blacklist'),
                color: 0xff0000
            }], ephemeral: true
        })
        const message = (await interaction.message.fetch())
        /**
         * @param {string[]} words 
         */
        const sendEmbed = async (words) => {
            await message.reply({
                embeds: [{
                    author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL()
                    },
                    color: 0x00ff00,
                    description: config.statusError('success', 'han sido borradas palabras en la blacklist del server de manera correcta'),
                    fields: [{
                        name: 'Palabras | 📝',
                        value: words.join(', ')
                    }]
                }]
            })
        }
        await message.edit({
            components: [{
                type: 1,
                components: [{
                    custom_id: "blacklist.addWords",
                    emoji: "📑",
                    label: "Agregar palabras",
                    style: 2,
                    disabled: true,
                    type: 2
                }, {
                    custom_id: "blacklist.deleteWords",
                    emoji: "❌",
                    label: "Eliminar palabras",
                    style: 1,
                    disabled: true,
                    type: 2
                }, {
                    custom_id: "blacklist.watchWords",
                    emoji: "❔",
                    label: "Ver palabras establecidas",
                    style: 2,
                    disabled: true,
                    type: 2
                }]
            }]
        })
        const enableButtons = async () => {
            await message.edit({
                components: [{
                    type: 1,
                    components: [{
                        custom_id: "blacklist.addWords",
                        emoji: "📑",
                        label: "Agregar palabras",
                        style: 3,
                        disabled: false,
                        type: 2
                    }, {
                        custom_id: "blacklist.deleteWords",
                        emoji: "❌",
                        label: "Eliminar palabras",
                        style: 4,
                        disabled: false,
                        type: 2
                    }, {
                        custom_id: "blacklist.watchWords",
                        emoji: "❔",
                        label: "Ver palabras establecidas",
                        style: 2,
                        disabled: false,
                        type: 2
                    }]
                }]
            })
        }
        await interaction.reply({
            embeds: [{
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL()
                },
                color: 0xffff00,
                description: 'A continuacion escribe las palabras que quieras borrar de la lista negra separadas cada una por un espacio :3',
            }],
            ephemeral: true
        });
        let palabras = await DeleteNewArrayBlacklist(client, interaction.guildId, (await message.channel.awaitMessages({ filter: i => i.author.id == interaction.user.id, max: 1 })).map(c => c)[0].content.trim().split(/ +/g));
        if (palabras.length <= 0) {
            await enableButtons();
            await message.reply({
                embeds: [{
                    description: config.statusError('error', 'las palabras que tratabas de borrar no se encuentran en la lista negra'),
                    color: 0xff0000
                }]
            });
        } else try {
            await enableButtons();
            await config.schemas.Blacklist.updateOne({ guildID: interaction.guildId }, { $pull: { words: { $in: palabras } } })
            await sendEmbed(palabras)
        } catch (error) {
            await config.error(message, error)
        }
    } catch (error) {
        await interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    customId: "blacklist.deleteWords",
    status: {
        code: 1,
        reason: null
    }
}