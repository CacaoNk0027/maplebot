"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const config_1 = require("../../../bot/config/config");
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const discord_js_1 = require("discord.js");
const emoji_regex_1 = __importDefault(require("emoji-regex"));
const command = {
    data: new command_data_1.default()
        .setName('emoji')
        .setId('005', '002')
        .setAliases('emote', 'e')
        .setDescription('Muestra un emoji del servidor')
        .setDescriptionLocalization('en-US', 'Shows a server emoji')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('emoji')
        .setDescription('El emoji a mostrar')
        .setDescriptionLocalization('en-US', 'The emoji to show')
        .setRequired(true)).addBooleanOption(new discord_js_1.SlashCommandBooleanOption()
        .setName('info')
        .setDescription('¿Mostrar información del emoji?')
        .setDescriptionLocalization('en-US', 'Show emoji information?')),
    async exec(interaction) {
        await emoji(interaction);
    },
    async message(message, args) {
        await emoji(message, args);
    }
};
exports.command = command;
async function emoji(target, args) {
    let option;
    let emoji;
    let emoji_parsed;
    let emoji_guild;
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        emoji = target.options.getString('emoji', true);
        option = target.options.getBoolean('info') ? 'info' : null;
    }
    else if (target instanceof discord_js_1.Message && args) {
        emoji = args[0];
        option = args[1];
    }
    else {
        emoji = null;
        option = null;
    }
    if (!emoji) {
        await (0, config_1.send)(target, 'warn', 'Debes colocar un emoji para mostrar', true);
        return;
    }
    if ((0, emoji_regex_1.default)().test(emoji)) {
        await (0, config_1.send)(target, 'warn', 'El emoji no puede ser preterminado de discord', true);
        return;
    }
    emoji_parsed = (0, discord_js_1.parseEmoji)(emoji);
    if (!emoji_parsed || !emoji_parsed.id) {
        await (0, config_1.send)(target, 'error', 'El emoji que colocaste es invalido o no se ha encontrado', true);
        return;
    }
    if (option?.toLowerCase() == 'info') {
        try {
            emoji_guild = await target.guild?.emojis.fetch(emoji_parsed.id);
            if (!emoji_guild) {
                await (0, config_1.send)(target, 'error', 'No se pudo obtener el emoji dado', true);
                return;
            }
            let embed = new discord_js_1.EmbedBuilder()
                .setTitle('🏓 Emoji | ' + emoji_guild?.name)
                .setColor((0, config_1.random_color)())
                .setDescription(`[url del emoji](${emoji_guild.imageURL()})`)
                .setFields([{
                    name: '🆔 | ID',
                    value: `\`${emoji_guild.id}\``,
                    inline: true
                }, {
                    name: '👤 | Autor',
                    value: `**${(await emoji_guild.fetchAuthor())?.globalName || (await emoji_guild.fetchAuthor())?.username || 'Autor desconocido'}**`,
                    inline: true
                }, {
                    name: '📽️ | Tipo',
                    value: emoji_guild.animated ? 'Animado' : 'Estático',
                    inline: true
                }, {
                    name: '🕑 | Fecha de creación',
                    value: `<t:${Math.floor(emoji_guild.createdTimestamp / 1000)}:F>`
                }, {
                    name: '📍 | Nombre completo',
                    value: (0, config_1.code_text)(`<:${emoji_guild.identifier}>`)
                }]).setThumbnail(emoji_guild.imageURL());
            await target.reply({ embeds: [embed] });
        }
        catch (error) {
            if (!emoji_guild) {
                await (0, config_1.send)(target, 'error', 'No se pudo obtener el emoji dado', true);
                return;
            }
        }
    }
    else {
        let url = new discord_js_1.CDN().emoji(emoji_parsed.id, { extension: emoji_parsed.animated ? 'gif' : 'webp' });
        await target.reply({ content: url });
    }
}
