const discord = require("discord.js")
const models = require("maplebot_models")
const { AddNewArrayBlacklist, interactionErrorMsg } = require("../../utils/exports")

/**
 * 
 * @param {discord.Client} client 
 * @param {discord.ButtonInteraction} interaction 
 */
exports.exec = async (client, interaction) => {
    try {
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
                    description: models.utils.statusError('success', 'han sido establecidas palabras en la blacklist del server de manera correcta'),
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
                    style: 1,
                    disabled: true,
                    type: 2
                }, {
                    custom_id: "blacklist.deleteWords",
                    emoji: "❌",
                    label: "Eliminar palabras",
                    style: 2,
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
                description: 'A continuacion escribe las palabras que quieras agregar a la lista negra separadas cada una por un espacio :3',
            }],
            ephemeral: true
        });
        let palabras = await AddNewArrayBlacklist(client, interaction.guildId, (await message.channel.awaitMessages({ filter: i => i.author.id == interaction.user.id, max: 1 })).map(c => c)[0].content.trim().split(/ +/g));
        if (await models.schemas.Blacklist.findOne({ guildID: interaction.guildId }) == null) {
            try {
                let blackDB = new models.schemas.Blacklist({ guildID: interaction.guildId, words: palabras })
                await blackDB.save();
                await sendEmbed(palabras);
                await enableButtons();
            } catch (error) {
                await models.utils.error(message, error);
            }
        } else {
            if (palabras.length <= 0) return await message.reply({
                embeds: [{
                    description: models.utils.statusError('error', 'las palabras que tratabas de establecer son palabras que no pueden agregarse o que ya estan establecidas'),
                    color: 0xff0000
                }]
            }); else try {
                await models.schemas.Blacklist.updateOne({ guildID: interaction.guildId }, { $push: { words: { $each: palabras } } })
                await sendEmbed(palabras)
                await enableButtons();
            } catch (error) {
                await models.utils.error(message, error)
            }
        }
    } catch (error) {
        await interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    customId: "blacklist.addWords",
    status: {
        code: 1,
        reason: null
    }
}