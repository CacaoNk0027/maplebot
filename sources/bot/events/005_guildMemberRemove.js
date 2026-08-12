"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Farewell_1 = __importDefault(require("../../shared/bot/models/Farewell"));
const discord_js_1 = require("discord.js");
const hex_color_regex_1 = __importDefault(require("hex-color-regex"));
const neekuro_1 = __importDefault(require("neekuro"));
const gma = {
    name: discord_js_1.Events.GuildMemberRemove,
    once: false,
    async exec(member) {
        try {
            const farewell = await Farewell_1.default.getByGuildId(member.guild.id);
            if (!farewell || !farewell.channel)
                return;
            const channel = await member.client.channels.fetch(farewell.channel);
            if (!channel || !channel.isSendable() || channel.isDMBased())
                return;
            if (channel.guildId !== member.guild.id)
                return;
            const replace_params = (text) => {
                return text.replace(/{user}/g, `${member.user.username}`)
                    .replace(/{server}/g, member.guild?.name || 'Servidor')
                    .replace(/{memberCount}/g, member.guild?.memberCount.toString() || '0');
            };
            if (farewell.messageType === 'embed') {
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle(replace_params(farewell.title || 'Hasta luego {user}'))
                    .setAuthor({
                    name: member.guild?.name || 'Servidor',
                    iconURL: member.guild?.iconURL() || undefined
                })
                    .setDescription(replace_params(farewell.description || 'Un placer haberte tenido'));
                if (farewell.background?.type === 'color') {
                    const color = farewell.background.value;
                    embed.setColor((0, hex_color_regex_1.default)({ strict: true }).test(color)
                        ? color
                        : '#1a1d1f');
                }
                else {
                    embed.setImage(farewell.background?.value || null);
                }
                await channel.send({
                    content: replace_params(farewell.message || '**{user}** ha salido del servidor'),
                    embeds: [embed],
                    allowedMentions: { parse: ['users'] }
                });
                return;
            }
            if (farewell.messageType === 'message') {
                await channel.send({
                    content: replace_params(farewell.message || `**{user}** ha salido del servidor`),
                    allowedMentions: { parse: ['users'] }
                });
                return;
            }
            if (farewell.messageType === 'image') {
                let image = new neekuro_1.default.Welcome()
                    .setAvatar(member.user.displayAvatarURL({ extension: 'png', size: 512 }), {
                    border: farewell.colors?.border
                })
                    .setTitle(replace_params(farewell.title || 'Hasta luego {user}'), {
                    text_color: farewell.colors?.title
                })
                    .setDescription(replace_params(farewell.description || 'Un placer haberte tenido'), {
                    text_color: farewell.colors?.description
                });
                if (farewell.background?.type === 'color') {
                    image.setBackground('color', farewell.background.value);
                }
                else if (farewell.background?.type === 'image') {
                    image.setBackground('image', farewell.background.value);
                }
                let attachment = new discord_js_1.AttachmentBuilder(await image.build(), { name: 'farewell.png' })
                    .setDescription('Imagen de despedida generada');
                await channel.send({
                    content: replace_params(farewell.message || `**{user}** ha salido del servidor`),
                    files: [attachment],
                    allowedMentions: { parse: ['users'] }
                });
            }
        }
        catch (error) {
            console.error('[GuildMemberRemove:ERR]! No se pudo enviar la despedida:', error);
        }
    }
};
exports.default = gma;
