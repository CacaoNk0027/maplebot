const discord = require('discord.js')

const ms = require('ms')
const config = require('../../utils/exports')

/**
 * @param {discord.Client} client
 * @param {discord.Message} message
 * @param {args} args
 */
exports.text = async (client, message, args) => {
    try {
        if(!args[0]) return await message.reply({
            embeds: [{
                description: config.statusError('error', 'es necesario poner algun texto en el parametro <texto>'),
                color: 0xff0000
            }]
        })
        if(args.length > 100) return await message.reply({
            embeds: [{
                description: config.statusError('error', 'el texto colocado no puerde revasar las 100 palabras'),
                color: 0xff0000
            }]
        })
        if(message.type == discord.MessageType.Reply) await (await message.channel.messages.fetch(message.reference.messageId)).reply({
            content: args.join(' ')
        }).then(async () => await message.delete()).catch(error => error); else await message.channel.send({
            content: args.join(' ')
        }).then(async () => await message.delete().catch(error => error));
    } catch (error) {
        console.error(error)
        await config.error(message, error);
    }
}

var pattern = new RegExp(
    "^(https?:\\/\\/)?" +
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
    "((\\d{1,3}\\.){3}\\d{1,3}))" +
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
    "(\\?[;&a-z\\d%_.~+=-]*)?" +
    "(\\#[-a-z\\d_]*)?$",
    "i"
);
/**
 * @param {discord.Client} client
 * @param {discord.ChatInputCommandInteraction} interaction
 */
exports.slash = async (client, interaction) => {
    const { options } = interaction;
    try {
        let m = options.getString("mensaje")
        function UrlCheck(str) {
            return pattern.test(str);
        }
        if (UrlCheck(m) === true) {
            if (!interaction.member.permissions.has(discord.PermissionFlagsBits.Administrator)) {
                return interaction.reply({ embeds: [{
                    description: config.statusError('error', 'No se permiten enlaces... Solo los administradores pueden colocarlos'),
                    color: 0xff0000 
                }], 
                ephemeral: true 
            });
            }
        }
        await interaction.channel.send(m);
        interaction.reply({ embeds: [{
            description: config.statusError('success', 'Ya se envio el mensaje'),
            color: 0x00ff00
        }], ephemeral: true });
    } catch (error) {
        console.error(error)
        await config.interactionErrorMsg(interaction, error)
    }
}


exports.help = {
    name: 'say',
    alias: ['decir'],
    id: '017',
    description: 'hazme hablar por ti OWO',
    category: 'utilidad',
    options: [{
        name: 'texto',
        required: true,
    }],
    permissions: {
        user: [],
        bot: ['SendMessages', 'EmbedLinks', 'ManageMessages'],
    },
    status: {
        code: 1,
        reason: null,
    },
    isNsfw: false,
    cooldown: (ms('3s')/1000)
}
