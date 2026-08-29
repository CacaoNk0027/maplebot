"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const emoji_regex_1 = __importDefault(require("emoji-regex"));
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../config/config");
const command = {
    data: new command_data_1.default()
        .setName('emoji')
        .setId('005', '002')
        .setAliases('emote', 'e')
        .setDescription('Muestra un emoji personalizado')
        .setDescriptionLocalization('en-US', 'Shows a custom emoji')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('emoji')
        .setDescription('El emoji a mostrar')
        .setDescriptionLocalization('en-US', 'The emoji to show')
        .setRequired(true))
        .addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
        .setName('info')
        .setDescription('¿Mostrar información del emoji?')
        .setDescriptionLocalization('en-US', 'Show emoji information?')),
    async exec(interaction) {
        await response(interaction);
    },
    async message(message, args) {
        await response(message, args);
    }
};
exports.command = command;
async function response(caller, args = []) {
    const locale = await (0, config_1._locale)(caller.guild);
    try {
        const rawEmoji = caller instanceof discord_js_1.ChatInputCommandInteraction
            ? caller.options.getString('emoji', true)
            : args[0];
        const showInfo = caller instanceof discord_js_1.ChatInputCommandInteraction
            ? caller.options.getBoolean('info') ?? false
            : args[1]?.toLowerCase() === 'info';
        if (!rawEmoji) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.005.required'), true);
            return;
        }
        if ((0, emoji_regex_1.default)().test(rawEmoji)) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.005.unicode'), true);
            return;
        }
        const parsedEmoji = (0, discord_js_1.parseEmoji)(rawEmoji);
        if (!parsedEmoji?.id) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.005.invalid'), true);
            return;
        }
        if (!showInfo) {
            const emojiURL = new discord_js_1.CDN().emoji(parsedEmoji.id, {
                extension: parsedEmoji.animated ? 'gif' : 'webp',
                size: 1024
            });
            await caller.reply({ content: emojiURL });
            return;
        }
        if (!caller.guild) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.guild_only'), true);
            return;
        }
        const guildEmoji = await caller.guild.emojis.fetch(parsedEmoji.id);
        if (!guildEmoji) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.005.not_found'), true);
            return;
        }
        const author = await guildEmoji.fetchAuthor();
        const type = guildEmoji.animated
            ? (0, config_1.text)(locale, 'cmd.002.005.type.animated')
            : (0, config_1.text)(locale, 'cmd.002.005.type.static');
        const fullEmoji = `<${guildEmoji.animated ? 'a' : ''}:${guildEmoji.identifier}>`;
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle((0, config_1.text)(locale, 'cmd.002.005.title', guildEmoji.name ?? (0, config_1.text)(locale, 'cmd.002.unknown')))
            .setColor((0, config_1.random_color)())
            .setDescription((0, config_1.text)(locale, 'cmd.002.005.url', guildEmoji.imageURL()))
            .setFields([{
                name: '🆔 | ID',
                value: `\`${guildEmoji.id}\``,
                inline: true
            }, {
                name: `👤 | ${(0, config_1.text)(locale, 'cmd.002.005.author')}`,
                value: `**${author.globalName || author.username}**`,
                inline: true
            }, {
                name: `📽️ | ${(0, config_1.text)(locale, 'cmd.002.005.type')}`,
                value: type,
                inline: true
            }, {
                name: `🕑 | ${(0, config_1.text)(locale, 'cmd.002.005.created')}`,
                value: `<t:${Math.floor(guildEmoji.createdTimestamp / 1000)}:F>`
            }, {
                name: `📍 | ${(0, config_1.text)(locale, 'cmd.002.005.full_name')}`,
                value: (0, config_1.code_text)(fullEmoji)
            }])
            .setThumbnail(guildEmoji.imageURL());
        await caller.reply({ embeds: [embed] });
    }
    catch (error) {
        console.error('[CommandEmoji:ERR] No se pudo procesar el emoji:', error);
        await (0, config_1.send)(caller, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
