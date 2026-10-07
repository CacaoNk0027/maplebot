"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openEmbedBuilder = openEmbedBuilder;
exports.handleSectionSelect = handleSectionSelect;
exports.handleChannelSelect = handleChannelSelect;
exports.handleSectionModal = handleSectionModal;
exports.handleSendButton = handleSendButton;
exports.handleCancelButton = handleCancelButton;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const color_1 = require("./color");
/** Límites que impone Discord; superarlos hace que rechace el mensaje entero. */
const LIMITS = {
    title: 256,
    description: 4000,
    footer: 2048,
    author: 256,
    total: 6000
};
const CHANNEL_PERMISSIONS = ['ViewChannel', 'SendMessages', 'EmbedLinks'];
const SECTIONS = ['contenido', 'imagenes', 'autor', 'pie'];
function encode(state) {
    return `${state.ownerId}:${state.channelId}:${state.messageId ?? '-'}`;
}
function decode(params) {
    const [ownerId, channelId, messageId] = params;
    return {
        ownerId: ownerId ?? '',
        channelId: channelId ?? '',
        messageId: !messageId || messageId === '-' ? null : messageId
    };
}
/** Abre el constructor: `embed` para uno nuevo, `embed editar <id>` para retocar. */
async function openEmbedBuilder(caller, args = []) {
    const locale = await (0, config_1._locale)(caller.guild);
    try {
        if (!caller.guild || !caller.channel || caller.channel.isDMBased()) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.008.guild_only'), true);
            return;
        }
        const messageId = readEditTarget(caller, args);
        let embed = new discord_js_1.EmbedBuilder().setDescription((0, config_1.text)(locale, 'cmd.002.008.empty'));
        if (messageId) {
            const original = await caller.channel.messages.fetch(messageId).catch(() => null);
            if (!original) {
                await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.008.message_not_found'), true);
                return;
            }
            if (original.author.id !== caller.client.user?.id) {
                await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.008.not_mine'), true);
                return;
            }
            if (!original.embeds.length) {
                await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.008.without_embed'), true);
                return;
            }
            embed = discord_js_1.EmbedBuilder.from(original.embeds[0]);
        }
        const state = {
            ownerId: caller instanceof discord_js_1.Message ? caller.author.id : caller.user.id,
            channelId: caller.channel.id,
            messageId
        };
        await caller.reply(panel(locale, embed, state));
    }
    catch (error) {
        console.error('[EmbedBuilder:ERR] No se pudo abrir el constructor:', error);
        await (0, config_1.send)(caller, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
/** Menú de secciones: abre el formulario correspondiente. */
async function handleSectionSelect(interaction) {
    const state = decode(interaction.customId.split(':').slice(1));
    const section = interaction.values[0];
    const locale = await (0, config_1._locale)(interaction.guild);
    await interaction.showModal(sectionModal(locale, section, currentEmbed(interaction.message), state));
}
/** Selector de canal de destino: solo cambia el estado y repinta el panel. */
async function handleChannelSelect(interaction) {
    const state = decode(interaction.customId.split(':').slice(1));
    const locale = await (0, config_1._locale)(interaction.guild);
    const channelId = interaction.values[0];
    // Cambiar de canal invalida el mensaje que se estaba editando: vive en el anterior.
    const updated = { ...state, channelId, messageId: null };
    await interaction.update(panel(locale, currentEmbed(interaction.message), updated));
}
/** Aplica lo enviado en un formulario al embed en construcción. */
async function handleSectionModal(interaction) {
    const params = interaction.customId.split(':').slice(1);
    const section = params.pop();
    const state = decode(params);
    const locale = await (0, config_1._locale)(interaction.guild);
    // El formulario se abre desde el panel, así que la interacción trae su
    // mensaje y puede actualizarlo en el sitio.
    if (!interaction.isFromMessage())
        return;
    const embed = currentEmbed(interaction.message);
    const problem = applySection(locale, embed, section, interaction);
    if (problem) {
        await (0, config_1.send)(interaction, 'warn', problem, true);
        return;
    }
    await interaction.update(panel(locale, embed, state));
}
/** Envía el embed al canal elegido, o edita el mensaje original. */
async function handleSendButton(interaction) {
    // Se lee el `customId` completo en vez de los `params` del despachador:
    // ese ya consume el dueño, asi que el estado llegaria corrido una posicion
    // y `channelId` acabaria valiendo el id del mensaje. Mismo criterio que en
    // los demas manejadores de este archivo.
    const state = decode(interaction.customId.split(':').slice(1));
    const locale = await (0, config_1._locale)(interaction.guild);
    const embed = currentEmbed(interaction.message);
    if (isEmpty(embed)) {
        await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'cmd.002.008.nothing_to_send'), true);
        return;
    }
    const total = totalLength(embed);
    if (total > LIMITS.total) {
        await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'cmd.002.008.too_long', total, LIMITS.total), true);
        return;
    }
    const channel = await interaction.guild?.channels.fetch(state.channelId).catch(() => null);
    if (!channel?.isTextBased() || channel.isDMBased()) {
        await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'cmd.002.008.channel_invalid'), true);
        return;
    }
    const missing = missingPermissions(channel);
    if (missing.length) {
        await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'cmd.002.008.channel_permissions', missing.join(', ')), true);
        return;
    }
    try {
        // Solo se envía el embed, sin contenido: un embed nunca genera menciones,
        // así que este comando no sirve para colar un @everyone.
        if (state.messageId) {
            const original = await channel.messages.fetch(state.messageId).catch(() => null);
            if (!original || original.author.id !== interaction.client.user?.id) {
                await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'cmd.002.008.message_not_found'), true);
                return;
            }
            await original.edit({ embeds: [embed] });
        }
        else {
            await channel.send({ embeds: [embed] });
        }
        await interaction.update({
            content: (0, config_1.text)(locale, state.messageId ? 'cmd.002.008.edited' : 'cmd.002.008.sent', `<#${channel.id}>`),
            embeds: [embed],
            components: []
        });
    }
    catch (error) {
        console.error('[EmbedBuilder:ERR] No se pudo enviar el embed:', error);
        await (0, config_1.send)(interaction, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
/** Cierra el constructor sin enviar nada. */
async function handleCancelButton(interaction) {
    const locale = await (0, config_1._locale)(interaction.guild);
    await interaction.update({
        content: (0, config_1.text)(locale, 'cmd.002.008.cancelled'),
        embeds: [],
        components: []
    });
}
function panel(locale, embed, state) {
    const encoded = encode(state);
    const sections = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId(`menu.007:${encoded}`)
        .setPlaceholder((0, config_1.text)(locale, 'cmd.002.008.sections.placeholder'))
        .addOptions(SECTIONS.map(section => ({
        label: (0, config_1.text)(locale, `cmd.002.008.section.${section}`),
        description: (0, config_1.text)(locale, `cmd.002.008.section.${section}.hint`),
        value: section
    })));
    const channels = new discord_js_1.ChannelSelectMenuBuilder()
        .setCustomId(`menu.008:${encoded}`)
        .setPlaceholder((0, config_1.text)(locale, 'cmd.002.008.channel.placeholder'))
        .addChannelTypes(discord_js_1.ChannelType.GuildText, discord_js_1.ChannelType.GuildAnnouncement);
    const actions = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`button.001:${encoded}`)
        .setStyle(discord_js_1.ButtonStyle.Success)
        .setLabel((0, config_1.text)(locale, state.messageId ? 'cmd.002.008.button.edit' : 'cmd.002.008.button.send')), new discord_js_1.ButtonBuilder()
        .setCustomId(`button.002:${encoded}`)
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setLabel((0, config_1.text)(locale, 'cmd.002.008.button.cancel')));
    return {
        content: (0, config_1.text)(locale, 'cmd.002.008.panel', `<#${state.channelId}>`),
        embeds: [embed],
        components: [
            new discord_js_1.ActionRowBuilder().addComponents(sections),
            new discord_js_1.ActionRowBuilder().addComponents(channels),
            actions
        ]
    };
}
function sectionModal(locale, section, embed, state) {
    const data = embed.data;
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId(`modal.016:${encode(state)}:${section}`)
        .setTitle((0, config_1.text)(locale, `cmd.002.008.section.${section}`));
    // Un modal admite 5 campos: por eso el embed se reparte en secciones.
    if (section === 'contenido') {
        modal.addLabelComponents(field(locale, 'title', data.title, discord_js_1.TextInputStyle.Short, LIMITS.title), field(locale, 'url', data.url, discord_js_1.TextInputStyle.Short, 400), field(locale, 'description', isPlaceholder(data.description) ? undefined : data.description, discord_js_1.TextInputStyle.Paragraph, LIMITS.description), field(locale, 'color', data.color === undefined ? undefined : (0, color_1.toHex)(fromDecimal(data.color)), discord_js_1.TextInputStyle.Short, 32), field(locale, 'timestamp', data.timestamp ? (0, config_1.text)(locale, 'cmd.002.008.yes') : undefined, discord_js_1.TextInputStyle.Short, 8));
        return modal;
    }
    if (section === 'imagenes') {
        modal.addLabelComponents(field(locale, 'image', data.image?.url, discord_js_1.TextInputStyle.Short, 400), field(locale, 'thumbnail', data.thumbnail?.url, discord_js_1.TextInputStyle.Short, 400));
        return modal;
    }
    if (section === 'autor') {
        modal.addLabelComponents(field(locale, 'author_name', data.author?.name, discord_js_1.TextInputStyle.Short, LIMITS.author), field(locale, 'author_icon', data.author?.icon_url, discord_js_1.TextInputStyle.Short, 400), field(locale, 'author_url', data.author?.url, discord_js_1.TextInputStyle.Short, 400));
        return modal;
    }
    modal.addLabelComponents(field(locale, 'footer_text', data.footer?.text, discord_js_1.TextInputStyle.Paragraph, LIMITS.footer), field(locale, 'footer_icon', data.footer?.icon_url, discord_js_1.TextInputStyle.Short, 400));
    return modal;
}
function field(locale, name, value, style, max) {
    const input = new discord_js_1.TextInputBuilder()
        .setCustomId(name)
        .setStyle(style)
        .setRequired(false)
        .setMaxLength(max);
    if (value)
        input.setValue(value.slice(0, max));
    return new discord_js_1.LabelBuilder()
        .setLabel((0, config_1.text)(locale, `cmd.002.008.field.${name}`))
        .setDescription((0, config_1.text)(locale, 'cmd.002.008.field.hint'))
        .setTextInputComponent(input);
}
/**
 * Vuelca el formulario sobre el embed. Un campo vacío borra esa propiedad, así
 * que dejarlo en blanco es la forma de quitar algo que ya estaba puesto.
 * Devuelve un mensaje de error, o null si todo era válido.
 */
function applySection(locale, embed, section, interaction) {
    const read = (name) => interaction.fields.getTextInputValue(name).trim();
    if (section === 'contenido') {
        const url = read('url');
        if (url && !isValidUrl(url))
            return (0, config_1.text)(locale, 'cmd.002.008.url_invalid');
        const color = read('color');
        if (color) {
            const parsed = (0, color_1.parseColor)(color);
            if (!parsed)
                return (0, config_1.text)(locale, 'cmd.002.008.color_invalid');
            embed.setColor((parsed.r << 16) + (parsed.g << 8) + parsed.b);
        }
        else {
            embed.setColor(null);
        }
        embed.setTitle(read('title') || null);
        embed.setURL(url || null);
        embed.setDescription(read('description') || null);
        embed.setTimestamp(affirmative(locale, read('timestamp')) ? new Date() : null);
        return null;
    }
    if (section === 'imagenes') {
        const image = read('image');
        const thumbnail = read('thumbnail');
        if (image && !isValidUrl(image))
            return (0, config_1.text)(locale, 'cmd.002.008.url_invalid');
        if (thumbnail && !isValidUrl(thumbnail))
            return (0, config_1.text)(locale, 'cmd.002.008.url_invalid');
        embed.setImage(image || null);
        embed.setThumbnail(thumbnail || null);
        return null;
    }
    if (section === 'autor') {
        const name = read('author_name');
        const icon = read('author_icon');
        const url = read('author_url');
        if (icon && !isValidUrl(icon))
            return (0, config_1.text)(locale, 'cmd.002.008.url_invalid');
        if (url && !isValidUrl(url))
            return (0, config_1.text)(locale, 'cmd.002.008.url_invalid');
        // Discord exige nombre: sin él, el icono y el enlace no se muestran.
        if (!name && (icon || url))
            return (0, config_1.text)(locale, 'cmd.002.008.author_name_required');
        embed.setAuthor(name ? { name, iconURL: icon || undefined, url: url || undefined } : null);
        return null;
    }
    const footerText = read('footer_text');
    const footerIcon = read('footer_icon');
    if (footerIcon && !isValidUrl(footerIcon))
        return (0, config_1.text)(locale, 'cmd.002.008.url_invalid');
    if (!footerText && footerIcon)
        return (0, config_1.text)(locale, 'cmd.002.008.footer_text_required');
    embed.setFooter(footerText ? { text: footerText, iconURL: footerIcon || undefined } : null);
    return null;
}
function currentEmbed(message) {
    const existing = message?.embeds?.[0];
    return existing ? discord_js_1.EmbedBuilder.from(existing) : new discord_js_1.EmbedBuilder();
}
function readEditTarget(caller, args) {
    if (caller instanceof discord_js_1.ChatInputCommandInteraction) {
        return caller.options.getString('message')?.match(/\d{16,22}/)?.[0] ?? null;
    }
    const words = args.filter(Boolean);
    if (!words.length)
        return null;
    if (!['editar', 'edit'].includes(words[0].toLocaleLowerCase()))
        return null;
    return words.slice(1).join(' ').match(/\d{16,22}/)?.[0] ?? null;
}
function missingPermissions(channel) {
    const me = channel.guild.members.me;
    if (!me)
        return CHANNEL_PERMISSIONS;
    const permissions = channel.permissionsFor(me);
    return CHANNEL_PERMISSIONS.filter(permission => !permissions?.has(permission));
}
/** Suma de los textos del embed, que Discord limita a 6000 en conjunto. */
function totalLength(embed) {
    const data = embed.data;
    const fields = (data.fields ?? []).reduce((sum, item) => sum + item.name.length + item.value.length, 0);
    return (data.title?.length ?? 0)
        + (data.description?.length ?? 0)
        + (data.footer?.text?.length ?? 0)
        + (data.author?.name?.length ?? 0)
        + fields;
}
function isEmpty(embed) {
    const data = embed.data;
    if (isPlaceholder(data.description)) {
        return !data.title && !data.image && !data.thumbnail && !data.author && !data.footer;
    }
    return !data.title
        && !data.description
        && !data.image
        && !data.thumbnail
        && !data.author
        && !data.footer
        && !(data.fields?.length);
}
/**
 * El panel arranca con un texto de relleno porque Discord no admite un embed
 * vacío. Se compara en los dos idiomas para no depender del idioma del servidor.
 */
function isPlaceholder(description) {
    if (!description)
        return true;
    return description === (0, config_1.text)('es-ES', 'cmd.002.008.empty')
        || description === (0, config_1.text)('en-US', 'cmd.002.008.empty');
}
function affirmative(locale, value) {
    if (!value)
        return false;
    const normalized = value.trim().toLocaleLowerCase();
    return ['si', 'sí', 'yes', 'y', '1', 'true'].includes(normalized)
        || normalized === (0, config_1.text)(locale, 'cmd.002.008.yes').toLocaleLowerCase();
}
function isValidUrl(value) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }
    catch {
        return false;
    }
}
function fromDecimal(color) {
    return {
        r: (color >> 16) & 0xff,
        g: (color >> 8) & 0xff,
        b: color & 0xff
    };
}
