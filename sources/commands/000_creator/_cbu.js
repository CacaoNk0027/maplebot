const discord = require('discord.js')
const models = require('maplebot_models')
const config = require('../../utils/exports')
const ms = require('ms')
const { CBU } = require('../../utils/models/_cbu')

/**
 * @param {discord.Client} client 
 * @param {discord.Message} message 
 * @param {import('../../../typings').args} args 
 */
exports.text = async (client, message, args) => {
    try {
        if (message.author.id !== "801603753631285308") return;
        let id = args[0];
        if(!id || id.length <= 0) return;
        if (id !== "-d") {
            if (await CBU.findOne({ creator: message.author.id }) == null) {
                let CBUDB = new CBU({
                    creator: message.author.id,
                    ids: [id.match(/\d{19}|\d{18}/g)[0]]
                })
                await CBUDB.save();
                return await message.reply({
                    content: "acción tomada - creando database"
                }).then(msg => {
                    setTimeout(async () => {
                        await msg.delete()
                        await message.delete().catch(err => err);
                    }, 3000);
                });
            } else {
                await CBU.updateOne({
                    creator: message.author.id
                }, {

                    $push: { ids: { $each: [id.match(/\d{19}|\d{18}/g)[0]] }}
                })
                return await message.reply({
                    content: "acción tomada - editando database"
                }).then(msg => {
                    setTimeout(async () => {
                        await msg.delete()
                        await message.delete().catch(err => err);
                    }, 3000);
                });
            }
        }
        if (CBU.findOne({ creator: message.author.id }) == null) return;
        await CBU.updateOne({
            creator: message.author.id
        }, { $pull: { ids: { $in: [args[1].match(/\d{19}|\d{18}/g)[0]] } }})
        return await message.reply({
            content: "acción tomada - editando database -d"
        }).then(msg => {
            setTimeout(async () => {
                await msg.delete()
                await message.delete().catch(err => err);
            }, 3000);
        });
    } catch (error) {
        console.log(error)
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
        await config.interactionErrorMsg(interaction, error)
    }
}

exports.help = {
    name: '_cbu',
    alias: [],
    id: 'c.001',
    description: 'Este comando esta habilitado solo para el owner',
    category: 'creador',
    options: [{
        name: "id_user",
        required: true
    }],
    permissions: {
        user: [],
        bot: []
    },
    status: {
        code: 1,
        reason: null
    },
    isNsfw: false,
    cooldown: (ms('3s') / 1000)
}