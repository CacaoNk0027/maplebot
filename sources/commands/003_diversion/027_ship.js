const discord = require('discord.js')
const models = require('maplebot_models')
const ms = require('ms');
const { Ship, switchPorcentageInAuthorAndUser, switchPorcentageInDiferentsUsers } = require("../../utils/exports");

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        let firstMember, secondMember;
        if (!args[0]) return await message.reply({
            embeds: [{
                description: models.utils.statusError('error', "debes poner la id de un usuario o mencionar un usuario"),
                color: 0xff0000
            }]
        }); else try {
            firstMember = await client.users.fetch(args[0].match(/\d{19}|\d{18}/g)[0])
        } catch (error) {
            return await message.reply({
                embeds: [{
                    description: models.utils.statusError('error', 'el usuario que haz mencionado es invalido'),
                    color: 0xff0000
                }]
            })
        }

        if (!args[1]) secondMember = message.author; else try {
            secondMember = await client.users.fetch(args[0].match(/\d{19}|\d{18}/g)[0])
        } catch (error) { secondMember = message.author; }

        let porcentage = Math.floor(Math.random() * 100)

        if (firstMember == message.author && secondMember == message.author) return await message.reply({
            embeds: [{
                description: `**100%**〘${models.utils.percentageBar(100, 0, 20)}〙\n:sparkling_heart: el amor hacia una persona debe comenzar por ti mismo, tu debes amarte y valorarte primero si no nadie lo hara`,
                color: 0x00ffff,
                image: {
                    url: `attachment://love.png`
                }
            }],
            files: [new discord.AttachmentBuilder().setName("love.png").setDescription(`Imagen de shipeo entre usuarios @Maple bot`).setFile(await new Ship().buildImage(firstMember, secondMember, 100))]
        }); else if (firstMember !== message.author && secondMember == message.author) return await message.reply({
            embeds: [{
                description: `**${porcentage.toString()}%**〘${models.utils.percentageBar(porcentage, 100 - porcentage, 20)}〙\n${switchPorcentageInAuthorAndUser(porcentage, firstMember, secondMember)}`,
                color: 0x00ffff,
                image: {
                    url: `attachment://love.png`
                }
            }],
            files: [new discord.AttachmentBuilder().setName('love.png').setDescription(`Imagen de shipeo entre usuaios @Maple bot`).setFile(await new Ship().buildImage(firstMember, secondMember, porcentage))]
        }); else if (firstMember == message.author && secondMember !== message.author) return await message.reply({
            embeds: [{
                description: `**${porcentage.toString()}%**〘${models.utils.percentageBar(porcentage, 100 - porcentage, 20)}〙\n${switchPorcentageInAuthorAndUser(porcentage, secondMember, firstMember)}`,
                color: 0x00ffff,
                image: {
                    url: `attachment://love.png`
                }
            }],
            files: [new discord.AttachmentBuilder().setName('love.png').setDescription(`Imagen de shipeo entre usuaios @Maple bot`).setFile(await new Ship().buildImage(firstMember, secondMember, porcentage))]
        }); else return await message.reply({
            embeds: [{
                description: `**${porcentage.toString()}%**〘${models.utils.percentageBar(porcentage, 100 - porcentage, 20)}〙\n${switchPorcentageInDiferentsUsers(porcentage, firstMember, secondMember)}`,
                color: 0x00ffff,
                image: {
                    url: `attachment://love.png`
                }
            }],
            files: [new discord.AttachmentBuilder().setName('love.png').setDescription(`Imagen de shipeo entre usuaios @Maple bot`).setFile(await new Ship().buildImage(firstMember, secondMember, porcentage))]
        });
    } catch (error) {
        await models.utils.error(message, error)
    }
}

/**
 * @param {discord.Client} client 
 * @param {discord.CommandInteraction} interaction 
 */
exports.slash = async (client, interaction) => {

}

exports.help = {
    name: "ship",
    alias: ['shipeo'],
    id: "027",
    description: "shipea a dos usuarios",
    category: "diversion",
    options: [{
        name: 'usuario 1', required: true
    }, {
        name: 'usuario 2', required: false
    }],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks']
    },
    status: {
        code: 0,
        reason: "comando preseta fallos, sin reparar"
    },
    isNsfw: false,
    cooldown: (ms('3ms') / 1000)
}