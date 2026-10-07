"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("../../bot/config/config");
const command_handler_1 = require("../../bot/config/command_handler");
const Guild_1 = __importDefault(require("../../shared/bot/models/Guild"));
const User_1 = __importDefault(require("../../shared/bot/models/User"));
const update_notice_1 = require("../structs/update_notice");
const cooldown = new discord_js_1.Collection();
const warnings = new discord_js_1.Collection();
const event = {
    name: discord_js_1.Events.MessageCreate,
    async exec(message) {
        let locale = 'es-ES';
        let shouldReplyOnError = false;
        try {
            if (!message.author || message.author.bot)
                return;
            if (message.channel.type != discord_js_1.ChannelType.GuildText)
                return;
            const prefix = await Guild_1.default.getPrefix(message.guild.id) || 'm!';
            const mentionPrefix = new RegExp(`^<@!?${message.client.user.id}>(?:\\s+|$)`);
            const mentionMatch = message.content.match(mentionPrefix);
            const usesGuildPrefix = message.content.toLowerCase().startsWith(prefix.toLowerCase());
            if (!usesGuildPrefix && !mentionMatch)
                return;
            shouldReplyOnError = true;
            const content = message.content
                .slice(mentionMatch ? mentionMatch[0].length : prefix.length)
                .trim();
            if (!content)
                return;
            locale = await (0, config_1._locale)(message.guild);
            const commands = await (0, command_handler_1.load_commands)();
            let args = content.split(/ +/g);
            let identifier = args.shift()?.toLowerCase();
            let command = commands.get(identifier) || commands.find(cmd => cmd.data.id == identifier || cmd.data.alias.includes(identifier));
            if (!command)
                return;
            const cooldownKey = command.data.name;
            if (command.data.inactive && !(0, config_1.is_allowed_id)(message.author.id)) {
                await (0, config_1.send)(message, 'error', (0, config_1.text)(locale, 'command.inactive'), true);
                return;
            }
            if (command.data.nsfw && !message.channel.nsfw) {
                await (0, config_1.send)(message, 'warn', (0, config_1.text)(locale, 'system.command.nsfw'), true);
                return;
            }
            let permissions = command.data.bot_permissions.filter(p => !message.guild?.members.me?.permissions.has(p));
            if (permissions.length > 0) {
                await message.reply({
                    content: (0, config_1.text)(locale, 'system.command.permissions.bot', (0, config_1.code_text)(permissions.join(' ')))
                });
                return;
            }
            permissions = command.data.user_permissions.filter(p => !message.member?.permissions.has(p));
            if (permissions.length > 0) {
                await message.reply({
                    content: (0, config_1.text)(locale, 'system.command.permissions.user', (0, config_1.code_text)(permissions.join(' ')))
                });
                return;
            }
            if (!cooldown.has(cooldownKey)) {
                cooldown.set(cooldownKey, new discord_js_1.Collection());
            }
            let timeNow = Date.now();
            let timeStamp = cooldown.get(cooldownKey);
            let cooldownAmount = command.data.cooldown * 1000;
            if (timeStamp?.has(message.author.id)) {
                let expirationTime = timeStamp.get(message.author.id) + cooldownAmount;
                if (timeNow < expirationTime) {
                    if (warnings.has(message.author.id))
                        return;
                    let timeLeft = expirationTime - timeNow;
                    await message.reply({
                        content: (0, config_1.text)(locale, 'system.command.cooldown', Math.floor(expirationTime / 1000))
                    }).then(msg => {
                        setTimeout(async () => {
                            await msg.delete().catch(console.error);
                        }, timeLeft >= 5000 ? 5000 : timeLeft - 1000);
                    });
                    warnings.set(message.author.id, timeLeft >= 5000 ? 5000 : timeLeft);
                    setTimeout(() => warnings.delete(message.author.id), timeLeft >= 5000 ? 5000 : timeLeft);
                    return;
                }
            }
            timeStamp?.set(message.author.id, timeNow);
            setTimeout(() => {
                timeStamp?.delete(message.author.id);
            }, cooldownAmount);
            const succeeded = await command.message(message, args);
            if (command.data.leveling && succeeded !== false) {
                await User_1.default.updateLevel(message.author.id);
            }
            // Va al final y con su propio catch: el aviso de actualizacion no
            // debe estropear un comando que ya respondio bien.
            await (0, update_notice_1.maybeAnnounceUpdate)(message.guild, message.channel).catch(error => {
                console.warn('[MessageCreate:WARN]! no se pudo anunciar la actualizacion:', error);
            });
        }
        catch (error) {
            console.error('[MessageCreate:ERR]! ha ocurrido un error:', error);
            if (shouldReplyOnError) {
                await (0, config_1.send)(message, 'error', (0, config_1.text)(locale, 'reply.error'), true).catch(replyError => {
                    console.error('[MessageCreate:ERR]! no se pudo responder el error:', replyError);
                });
            }
        }
    }
};
exports.default = event;
