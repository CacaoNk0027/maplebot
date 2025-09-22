"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("../../bot/config/config");
const command_handler_1 = require("../../bot/config/command_handler");
const Guild_1 = __importDefault(require("../../shared/bot/models/Guild"));
const cooldown = new discord_js_1.Collection();
const warnings = new discord_js_1.Collection();
const event = {
    name: discord_js_1.Events.MessageCreate,
    async exec(message) {
        try {
            let commands = await (0, command_handler_1.load_commands)();
            if (message.author.bot)
                return;
            if (message.channel.type != discord_js_1.ChannelType.GuildText)
                return;
            let prefix = await Guild_1.default.getPrefix(message.guild.id) || 'm!';
            if (!message.content.toLowerCase().startsWith(prefix))
                return;
            let args = message.content.slice(prefix.length).trim().split(/ +/g);
            let identifier = args.shift()?.toLowerCase();
            let command = commands.get(identifier) || commands.find(cmd => cmd.data.id == identifier || cmd.data.alias.includes(identifier));
            if (!command)
                return;
            if (command.data.inactive && !(0, config_1.is_allowed_id)(message.author.id)) {
                await (0, config_1.send)(message, 'error', 'El comando actual esta inactivo', true);
                return;
            }
            if (command.data.nsfw && !message.channel.nsfw) {
                await (0, config_1.send)(message, 'warn', 'Este comando necesita ser ejecutado en un canal nsfw', true);
                return;
            }
            let permissions = command.data.bot_permissions.filter(p => !message.guild?.members.me?.permissions.has(p));
            if (permissions.length > 0) {
                await message.reply({
                    content: `Requiero de los siguentes permisos para ejecutar este comando:\n${(0, config_1.code_text)(permissions.join(' '))}`
                });
                return;
            }
            permissions = command.data.user_permissions.filter(p => !message.member?.permissions.has(p));
            if (permissions.length > 0) {
                await message.reply({
                    content: `No puedes ejecutar este comando sin los siguentes permisos:\n${(0, config_1.code_text)(permissions.join(' '))}`
                });
                return;
            }
            if (!cooldown.has(identifier)) {
                cooldown.set(identifier, new discord_js_1.Collection());
            }
            let timeNow = Date.now();
            let timeStamp = cooldown.get(identifier);
            let cooldownAmount = command.data.cooldown * 1000;
            if (timeStamp?.has(message.author.id)) {
                let expirationTime = timeStamp.get(message.author.id) + cooldownAmount;
                if (timeNow < expirationTime) {
                    if (warnings.has(message.author.id))
                        return;
                    let timeLeft = expirationTime - timeNow;
                    await message.reply({
                        content: `Usa este comando <t:${Math.floor(expirationTime / 1000)}:R>`
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
            await command.message(message, args);
        }
        catch (error) {
            console.error('[MessageCreate:ERR]! ha ocurrido un error:', error);
        }
    }
};
exports.default = event;
