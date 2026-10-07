"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMessageDelete = logMessageDelete;
exports.logMessageUpdate = logMessageUpdate;
exports.logMessagePurge = logMessagePurge;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const log_dispatch_1 = require("./log_dispatch");
const CONTENT_LIMIT = 900;
/**
 * Registra un mensaje borrado.
 *
 * El contenido solo existe si el mensaje estaba en la caché del bot: Discord no
 * lo envía en el evento. Si falta, se registra igual el quién, el dónde y el
 * cuándo, que es lo que la moderación necesita para tirar del hilo.
 */
async function logMessageDelete(message) {
    if (!usable(message))
        return;
    if (!await (0, log_dispatch_1.isLogEnabled)(message.guild.id, 'message.delete'))
        return;
    const locale = await (0, config_1._locale)(message.guild);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Red)
        .setTitle((0, config_1.text)(locale, 'log.message.delete.title'))
        .addFields({ name: (0, config_1.text)(locale, 'log.field.author'), value: author(message, locale), inline: true }, { name: (0, config_1.text)(locale, 'log.field.channel'), value: `<#${message.channelId}>`, inline: true })
        .addFields({
        name: (0, config_1.text)(locale, 'log.field.content'),
        value: content(message.content, locale)
    })
        .setTimestamp();
    if (message.id)
        embed.setFooter({ text: `ID: ${message.id}` });
    await (0, log_dispatch_1.sendLog)(message.guild, 'message.delete', embed);
}
/** Registra una edición. Ignora los cambios que no tocan el texto. */
async function logMessageUpdate(before, after) {
    if (!usable(after))
        return;
    // Los embeds que Discord genera al cargar un enlace también emiten este
    // evento: sin esta comprobación el canal se llenaría de registros vacíos.
    if (before.content === after.content)
        return;
    if (!await (0, log_dispatch_1.isLogEnabled)(after.guild.id, 'message.edit'))
        return;
    const locale = await (0, config_1._locale)(after.guild);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Yellow)
        .setTitle((0, config_1.text)(locale, 'log.message.edit.title'))
        .addFields({ name: (0, config_1.text)(locale, 'log.field.author'), value: author(after, locale), inline: true }, { name: (0, config_1.text)(locale, 'log.field.channel'), value: `<#${after.channelId}>`, inline: true })
        .addFields({ name: (0, config_1.text)(locale, 'log.field.before'), value: content(before.content, locale) }, { name: (0, config_1.text)(locale, 'log.field.after'), value: content(after.content, locale) })
        .setTimestamp();
    if (after.url) {
        embed.addFields({ name: (0, config_1.text)(locale, 'log.field.message'), value: (0, config_1.text)(locale, 'log.message.jump', after.url) });
    }
    await (0, log_dispatch_1.sendLog)(after.guild, 'message.edit', embed);
}
/**
 * Registra una purga en un solo mensaje.
 *
 * Un borrado masivo puede llevarse cien mensajes; enviarlos uno a uno llenaría
 * el canal de registros y chocaría con los límites de Discord.
 */
async function logMessagePurge(messages, channel) {
    if (!channel.guild)
        return;
    if (!await (0, log_dispatch_1.isLogEnabled)(channel.guild.id, 'message.purge'))
        return;
    const locale = await (0, config_1._locale)(channel.guild);
    const authors = new Map();
    for (const message of messages.values()) {
        if (!message.author)
            continue;
        authors.set(message.author.id, (authors.get(message.author.id) ?? 0) + 1);
    }
    const summary = [...authors.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id, total]) => `<@${id}> — ${total}`)
        .join('\n');
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.DarkRed)
        .setTitle((0, config_1.text)(locale, 'log.message.purge.title'))
        .addFields({ name: (0, config_1.text)(locale, 'log.field.channel'), value: `<#${channel.id}>`, inline: true }, { name: (0, config_1.text)(locale, 'log.field.count'), value: String(messages.size), inline: true })
        .setTimestamp();
    if (summary) {
        embed.addFields({ name: (0, config_1.text)(locale, 'log.field.authors'), value: summary });
    }
    await (0, log_dispatch_1.sendLog)(channel.guild, 'message.purge', embed);
}
function usable(message) {
    if (!message.guild)
        return false;
    // Se descartan los mensajes de bots, pero solo cuando se conoce al autor:
    // un mensaje que no estaba en caché llega sin él, y en ese caso se registra
    // con autor desconocido en vez de perderse.
    if (message.author?.bot)
        return false;
    return true;
}
function author(message, locale) {
    if (!message.author)
        return (0, config_1.text)(locale, 'log.unknown');
    return `${message.author} (${(0, discord_js_1.escapeMarkdown)(message.author.tag)})`;
}
function content(value, locale) {
    if (!value)
        return (0, config_1.text)(locale, 'log.message.unavailable');
    return value.length > CONTENT_LIMIT ? `${value.slice(0, CONTENT_LIMIT)}…` : value;
}
