// importaciones

const discord = require('discord.js')
const models = require('maplebot_models')
const configs = require('../utils/exports.js')

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
        if (configs.blacklist.servers.find(c => c.includes(message.guildId))) return;
        if (configs.blacklist.users.find(c => c.includes(message.author.id))) return;
        if (message.channel.type == 1 || message.author.bot) return;
        if (await models.schemas.Blacklist.findOne({ guildID: message.guildId }) == null);
        else if ((await models.schemas.Blacklist.findOne({ guildID: message.guildId }).exec()).words.length <= 0); else {
            let msgFilter_obj_ = {
                words: (await models.schemas.Blacklist.findOne({ guildID: message.guildId }).exec()).words,
                guildId: (await models.schemas.Blacklist.findOne({ guildID: message.guildId }).exec()).guildID
            }
            if (message.member.permissionsIn(message.channelId).has('ManageMessages'));
            else if (msgFilter_obj_.words.find(c => message.content.toLowerCase().includes(c.toLowerCase()) == true) && message.guildId == msgFilter_obj_.guildId) {
                await message.delete().catch(() => { });
                let msg = await message.channel.send({
                    content: models.utils.statusError('warn', `cuida tu lenguaje <@${message.author.id}>`),
                    allowedMentions: { parse: ['users'] }
                }); setTimeout(async () => {
                    await msg.delete().catch(() => { });
                }, ms('5s'))
                // new DiscordWarn(message);
            }
        }
        let prefixes = await models.utils.prefix(client, message.guild);
        let usedPrefix = prefixes.find(p => message.content.toLowerCase().startsWith(p));
        if (!usedPrefix) return; if (!message.channel.permissionsFor(client.user.id).has("SendMessages")) return;
        var args = message.content.slice(usedPrefix.length).trim().split(/ +/g), command = args.shift().toLowerCase();
        if (prefixes.splice(0, 2).find(v => message.content.toLowerCase().startsWith(v)) && !command) return await message.reply({
            content: 'Hola! <:mkMaple_love:836387326552440902> soy **' + client.user.username + '**, si deseas ver mis comandos escribe \`m!help\` o usa el comando de slash /help'
        }); if (!command) return;
        var cmd = client.comandos.get(command) || client.comandos.find(c => c.query.alias.includes(command)) || client.comandos.find(c => c.query.id == command)
        if (cmd) {
            if (!message.channel.permissionsFor(client.user.id).has('ReadMessageHistory')) return await message.channel.send({
                content: models.utils.statusError('warn', `Recomiendo que tenga permisos de \`${permissions['ReadMessageHistory']}\` ya que generalmente me baso en respuestas`)
            }); if (cmd.help.status.code == 0 && message.author.id !== "801603753631285308") return await message.reply({
                content: models.utils.statusError('rolplayDanger', `lo siento.. pero actualmente el comando **${cmd.query.name}** esta inactivo debido a lo siguente`) + `\n\`\`\`\nRazon: ${cmd.help.status.reason == null ? "no hay razon :c" : cmd.help.status.reason}\n\`\`\``
            }); if (cmd.config.isNsfw == true && !message.channel.nsfw) return await message.reply({
                content: models.utils.statusError('error', "este comando requiere que sea ejecutado en un canal nsfw")
            }); if (cmd.config.embeds == true && !message.channel.permissionsFor(this.client.user.id).has('EmbedLinks')) return await message.reply({
                content: models.utils.statusError('error', `necesito el permiso \`${permissions['EmbedLinks']}\` para completar esta acción`)
            });

            if (!cooldowns.has(cmd.query.name)) {
                cooldowns.set(cmd.query.name, new discord.Collection());
            }

            const currentTime = Date.now();
            const timeStamps = cooldowns.get(cmd.query.name);
            const cooldownAmount = (cmd.config.cooldown) * 1000;

            if (timeStamps.has(message.author.id)) {
                const expirationTime = timeStamps.get(message.author.id) + cooldownAmount;
                if (currentTime < expirationTime) {
                    const timeLeft = (expirationTime - currentTime) / 1000;
                    const hours = Math.floor(timeLeft / 3600) % 24;
                    const minutes = Math.floor(timeLeft / 60) % 60;
                    const seconds = Math.floor(timeLeft / 1) % 60;

                    if (timeLeft > 3600) return await message.reply({
                        content: models.utils.statusError('warn', `Por favor espera \`${hours} Horas ${minutes} Minutos ${seconds} Segundos\` antes de volver a usar el comando \`${cmd.query.name}\``)
                    }); else if (timeLeft > 60) return await message.reply({
                        content: models.utils.statusError('warn', `Por favor espera \`${minutes} Minutos ${seconds} Segundos\` antes de volver a usar el comando \`${cmd.query.name}\``)
                    }); else return await message.reply({
                        content: models.utils.statusError('warn', `Por favor espera \`${seconds} Segundos\` antes de volver a usar el comando \`${cmd.query.name}\``)
                    });
                }
            }
            timeStamps.set(message.author.id, currentTime);
            setTimeout(() => timeStamps.delete(message.author.id), cooldownAmount)

            await new cmd(this.client, message, args).exec();
        } else {
            await message.reply({
                content: models.utils.statusError('rolplayDanger', `no he podido reconocer el comando **${command}**`)
            });
        }
    }
}