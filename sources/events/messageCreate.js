// importaciones

const discord = require('discord.js')
const models = require('maplebot_models')
const config = require('../utils/exports.js')
const { CBU } = require('../utils/models/_cbu.js')
const { CBS } = require('../utils/models/_cbs.js')

// arreglo temporal de usuarios con cooldown en x comando

const cooldown = new discord.Collection()

// exportacion de arreglo con nombre y funcion del evento

exports.event = {
    // nombre
    name: "messageCreate",
    /**
     * funcion principal para la ejecicion del evento
     * @param {discord.Client} client 
     * @param {discord.Message} message
     */
    exec: async (client, message) => {
        if(await CBU.findOne({ creator: "801603753631285308" }) != null) {
            let blacklist = await CBU.findOne({ creator: "801603753631285308" }).exec().then((c) => c.ids);
            if (blacklist.find(c => c.includes(message.author.id))) return;
        };
        if(await CBS.findOne({ creator: "801603753631285308" }) != null) {
            let blacklist = await CBS.findOne({ creator: "801603753631285308" }).exec().then((c) => c.ids);
            if (blacklist.find(c => c.includes(message.guildId)) && message.author.id !== "801603753631285308") return;
        };
        if (message.channel.type == 1 || message.author.bot) return;
        if (await config.schemas.Blacklist.findOne({ guildID: message.guildId }) == null);
        else if ((await config.schemas.Blacklist.findOne({ guildID: message.guildId }).exec()).words.length <= 0); else {
            let msgFilter_obj_ = {
                words: (await config.schemas.Blacklist.findOne({ guildID: message.guildId }).exec()).words,
                guildId: (await config.schemas.Blacklist.findOne({ guildID: message.guildId }).exec()).guildID
            }
            if (message.member.permissionsIn(message.channelId).has('ManageMessages'));
            else if (msgFilter_obj_.words.find(c => message.content.toLowerCase().includes(c.toLowerCase()) == true) && message.guildId == msgFilter_obj_.guildId) {
                await message.delete().catch(() => { });
                let msg = await message.channel.send({
                    content: config.statusError('warn', `cuida tu lenguaje <@${message.author.id}>`),
                    allowedMentions: { parse: ['users'] }
                }); setTimeout(async () => {
                    await msg.delete().catch(() => { });
                }, ms('5s'))
                // new DiscordWarn(message);
            }
        }
        let prefixes;
        try {
            let prefixDB = await config.schemas.SetPrefix.findOne({ guildID: guild.id }).exec().then(c => c.prefix)
            prefixes = [`<@${client.user.id}>`, `<@!${client.user.id}>`, prefixDB]
        } catch (error) {
            prefixes = [`<@${client.user.id}>`, `<@!${client.user.id}>`, "m!", "maple"]
        }
        let usedPrefix = prefixes.find(p => message.content.toLowerCase().startsWith(p));
        if (!usedPrefix) return;
        var args = message.content.slice(usedPrefix.length).trim().split(/ +/g), command = args.shift().toLowerCase();
        if (prefixes.splice(0, 2).find(v => message.content.toLowerCase().startsWith(v)) && !command) return await message.reply({
            content: 'Hola! <:mkMaple_love:836387326552440902> soy **' + client.user.username + '**, si deseas ver mis comandos escribe \`m!help\` o usa el comando de slash /help'
        }); if (!command) return;
        var cmd = client.comandos.get(command) || client.comandos.find(c => c.help.alias.includes(command)) || client.comandos.find(c => c.help.id == command)
        if (cmd) {
            if (!message.channel.permissionsFor(client.user.id).has('ReadMessageHistory')) return await message.channel.send({
                content: config.statusError('warn', `Recomiendo que tenga permisos de \`${config.permissions['ReadMessageHistory']}\` ya que generalmente me baso en respuestas`)
            }); if (cmd.help.status.code == 0 && message.author.id !== "801603753631285308") return await message.reply({
                content: config.statusError('rolplayDanger', `lo siento.. pero actualmente el comando **${cmd.help.name}** esta inactivo debido a lo siguente`) + `\n\`\`\`\nRazon: ${cmd.help.status.reason == null ? "no hay razon :c" : cmd.help.status.reason}\n\`\`\``
            }); if (cmd.help.isNsfw == true && !message.channel.nsfw) return await message.reply({
                content: config.statusError('error', "este comando requiere que sea ejecutado en un canal nsfw")
            }); if (cmd.help.permissions.bot.find(c => c.includes('EmbedLinks') == true) && !message.channel.permissionsFor(client.user.id).has('EmbedLinks')) return await message.reply({
                content: config.statusError('error', `necesito el permiso \`${permissions['EmbedLinks']}\` para completar esta acción`)
            });

            if (!cooldown.has(cmd.help.name)) {
                cooldown.set(cmd.help.name, new discord.Collection());
            }

            const currentTime = Date.now();
            const timeStamps = cooldown.get(cmd.help.name);
            const cooldownAmount = (cmd.help.cooldown) * 1000;

            if (timeStamps.has(message.author.id)) {
                const expirationTime = timeStamps.get(message.author.id) + cooldownAmount;
                if (currentTime < expirationTime) {
                    const timeLeft = (expirationTime - currentTime) / 1000;
                    const hours = Math.floor(timeLeft / 3600) % 24;
                    const minutes = Math.floor(timeLeft / 60) % 60;
                    const seconds = Math.floor(timeLeft / 1) % 60;

                    if (timeLeft > 3600) return await message.reply({
                        content: config.statusError('warn', `Por favor espera \`${hours} Horas ${minutes} Minutos ${seconds} Segundos\` antes de volver a usar el comando \`${cmd.help.name}\``)
                    }).then(async msg => await msg.delete().catch(console.error));
                    if (timeLeft > 60) return await message.reply({
                        content: config.statusError('warn', `Por favor espera \`${minutes} Minutos ${seconds} Segundos\` antes de volver a usar el comando \`${cmd.help.name}\``)
                    }).then(async msg => await msg.delete().catch(console.error)); else return await message.reply({
                        content: config.statusError('warn', `Por favor espera \`${seconds} Segundos\` antes de volver a usar el comando \`${cmd.help.name}\``)
                    });
                }
            }
            timeStamps.set(message.author.id, currentTime);
            setTimeout(() => timeStamps.delete(message.author.id), cooldownAmount)

            if(cmd.help.id.split('.')[0] == "c" && message.author.id !== "801603753631285308") return await message.reply({
                content: config.statusError('rolplayMe', 'este comando solamente es permitido para el uso del owner')
            }).then(msg => {
                setTimeout(async () => {
                    await msg.delete().catch(err => err)
                }, 4000);
            })
            await cmd.exec(client, message, args);
        } else {
            await message.reply({
                content: config.statusError('rolplayDanger', `no he podido reconocer el comando **${command}**`)
            });
        }
    }
}