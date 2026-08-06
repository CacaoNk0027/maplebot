"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Welcome_1 = __importDefault(require("../../shared/bot/models/Welcome"));
const discord_js_1 = require("discord.js");
const hex_color_regex_1 = __importDefault(require("hex-color-regex"));
const neekuro_1 = __importDefault(require("neekuro"));
const gma = {
    name: discord_js_1.Events.GuildMemberAdd,
    once: false,
    async exec(member) {
        try {
            const welcome = await Welcome_1.default.getByGuildId(member.guild.id);
            if (!welcome || !welcome.channel)
                return;
            const channel = await member.client.channels.fetch(welcome.channel);
            if (!channel || !channel.isSendable() || channel.isDMBased())
                return;
            if (channel.guildId !== member.guild.id)
                return;
            const replace_params = (text) => {
                return text.replace(/{user}/g, `${member.user.username}`)
                    .replace(/{server}/g, member.guild?.name || 'Servidor')
                    .replace(/{memberCount}/g, member.guild?.memberCount.toString() || '0');
            };
            const replace_in_message = (text) => {
                return text.replace(/{user}/g, `<@${member.user.id}>`)
                    .replace(/{server}/g, member.guild?.name || 'Servidor')
                    .replace(/{memberCount}/g, member.guild?.memberCount.toString() || '0');
            };
            if (welcome.messageType === 'embed') {
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle(replace_params(welcome.title || '¡Bienvenido {user}!'))
                    .setAuthor({
                    name: member.guild?.name || 'Servidor',
                    iconURL: member.guild?.iconURL() || undefined
                })
                    .setDescription(replace_params(welcome.description || '¡Gracias por unirte!'));
                if (welcome.background?.type === 'color') {
                    const color = welcome.background.value;
                    embed.setColor((0, hex_color_regex_1.default)({ strict: true }).test(color)
                        ? color
                        : '#1a1d1f');
                }
                else {
                    embed.setImage(welcome.background?.value || null);
                }
                await channel.send({
                    content: replace_in_message(welcome.message || '{user}'),
                    embeds: [embed],
                    allowedMentions: { parse: ['users'] }
                });
                return;
            }
            if (welcome.messageType === 'message') {
                await channel.send({
                    content: replace_in_message(welcome.message || `{user} ¡Bienvenido al servidor!`),
                    allowedMentions: { parse: ['users'] }
                });
                return;
            }
            if (welcome.messageType === 'image') {
                let image = new neekuro_1.default.Welcome()
                    .setAvatar(member.user.displayAvatarURL({ extension: 'png', size: 512 }), {
                    border: welcome.colors?.border
                })
                    .setTitle(replace_params(welcome.title || '¡Bienvenido {user}!'), {
                    text_color: welcome.colors?.title
                })
                    .setDescription(replace_params(welcome.description || '¡Gracias por unirte!'), {
                    text_color: welcome.colors?.description
                });
                if (welcome.background?.type === 'color') {
                    image.setBackground('color', welcome.background.value);
                }
                else if (welcome.background?.type === 'image') {
                    image.setBackground('image', welcome.background.value);
                }
                let attachment = new discord_js_1.AttachmentBuilder(await image.build(), { name: 'welcome.png' })
                    .setDescription('Imagen de bienvenida generada');
                await channel.send({
                    content: replace_in_message(welcome.message || `{user}`),
                    files: [attachment],
                    allowedMentions: { parse: ['users'] }
                });
            }
        }
        catch (error) {
            console.error('[GuildMemberAdd:ERR]! No se pudo enviar la bienvenida:', error);
        }
    }
};
exports.default = gma;
