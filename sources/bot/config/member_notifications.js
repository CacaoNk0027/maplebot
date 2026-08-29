"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationConfig = getNotificationConfig;
exports.showNotificationConfiguration = showNotificationConfiguration;
exports.showNotificationPreview = showNotificationPreview;
exports.renderNotificationTemplate = renderNotificationTemplate;
exports.buildNotificationPayload = buildNotificationPayload;
exports.sendConfiguredNotification = sendConfiguredNotification;
exports.notificationChannelMissingPermissions = notificationChannelMissingPermissions;
exports.isSafeNotificationImageUrl = isSafeNotificationImageUrl;
exports.showNotificationModal = showNotificationModal;
exports.handleNotificationModal = handleNotificationModal;
const discord_js_1 = require("discord.js");
const hex_color_regex_1 = __importDefault(require("hex-color-regex"));
const neekuro_1 = __importDefault(require("neekuro"));
const Welcome_1 = __importDefault(require("../../shared/bot/models/Welcome"));
const Farewell_1 = __importDefault(require("../../shared/bot/models/Farewell"));
const config_1 = require("./config");
const menuIds = {
    welcome: 'menu.004',
    farewell: 'menu.005'
};
const modalIds = {
    welcome: {
        type: 'modal.001', channel: 'modal.002', title: 'modal.003', description: 'modal.004',
        message: 'modal.005', background: 'modal.006', colors: 'modal.007'
    },
    farewell: {
        type: 'modal.008', channel: 'modal.009', title: 'modal.010', description: 'modal.011',
        message: 'modal.012', background: 'modal.013', colors: 'modal.014'
    }
};
const actionByValue = {
    '001': 'type',
    '002': 'channel',
    '003': 'title',
    '004': 'description',
    '005': 'message',
    '006': 'background',
    '007': 'colors'
};
const notificationCache = new Map();
const NOTIFICATION_CACHE_TTL = 60_000;
async function getNotificationConfig(kind, guildId) {
    const cacheKey = `${kind}:${guildId}`;
    const cached = notificationCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now())
        return cached.value;
    const document = kind === 'welcome'
        ? await Welcome_1.default.getByGuildId(guildId)
        : await Farewell_1.default.getByGuildId(guildId);
    const value = document ? {
        channel: document.channel,
        messageType: document.messageType,
        title: document.title,
        description: document.description,
        message: document.message,
        background: document.background ? { ...document.background } : null,
        colors: document.colors ? { ...document.colors } : null
    } : null;
    notificationCache.set(cacheKey, {
        value,
        expiresAt: Date.now() + NOTIFICATION_CACHE_TTL
    });
    return value;
}
async function showNotificationConfiguration(caller, kind) {
    const locale = await (0, config_1._locale)(caller.guild);
    if (!caller.guild) {
        await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'system.004.guild_only'), true);
        return;
    }
    const menu = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId(`${menuIds[kind]}:${caller instanceof discord_js_1.Message ? caller.author.id : caller.user.id}`)
        .setPlaceholder((0, config_1.text)(locale, 'system.004.menu.placeholder'))
        .addOptions(Object.entries(actionByValue).map(([value, action]) => ({
        label: (0, config_1.text)(locale, `system.004.menu.${action}.label`),
        value,
        description: (0, config_1.text)(locale, `system.004.menu.${action}.description`)
    })));
    await caller.reply({
        embeds: [{
                title: (0, config_1.text)(locale, `system.004.${kind}.menu.title`),
                description: (0, config_1.text)(locale, `system.004.${kind}.menu.description`),
                color: discord_js_1.Colors.Blurple
            }],
        components: [new discord_js_1.ActionRowBuilder().addComponents(menu)]
    });
}
async function showNotificationPreview(caller, kind) {
    const locale = await (0, config_1._locale)(caller.guild);
    if (!caller.guild) {
        await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'system.004.guild_only'), true);
        return;
    }
    const config = await getNotificationConfig(kind, caller.guild.id);
    if (!config) {
        await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, `system.004.${kind}.not_configured`), true);
        return;
    }
    const userId = caller instanceof discord_js_1.Message ? caller.author.id : caller.user.id;
    const member = await caller.guild.members.fetch(userId);
    await caller.reply(await buildNotificationPayload(kind, config, member, locale));
}
function renderNotificationTemplate(template, member, mentionUser = false) {
    return template
        .replace(/{user}/g, mentionUser ? `<@${member.id}>` : member.user.username)
        .replace(/{server}/g, member.guild.name)
        .replace(/{memberCount}/g, String(member.guild.memberCount));
}
async function buildNotificationPayload(kind, config, member, locale) {
    const messageType = config.messageType ?? 'message';
    const contentTemplate = config.message ?? (0, config_1.text)(locale, `system.004.${kind}.default.message`);
    const titleTemplate = config.title ?? (0, config_1.text)(locale, `system.004.${kind}.default.title`);
    const descriptionTemplate = config.description ?? (0, config_1.text)(locale, `system.004.${kind}.default.description`);
    const content = renderNotificationTemplate(contentTemplate, member, kind === 'welcome');
    const allowedMentions = kind === 'welcome'
        ? { parse: [], users: [member.id] }
        : { parse: [] };
    if (messageType === 'message') {
        return { content, allowedMentions };
    }
    const background = safeBackground(config.background);
    if (messageType === 'embed') {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(renderNotificationTemplate(titleTemplate, member))
            .setAuthor({
            name: member.guild.name,
            iconURL: member.guild.iconURL() ?? undefined
        })
            .setThumbnail(member.user.avatarURL({ forceStatic: false }))
            .setDescription(renderNotificationTemplate(descriptionTemplate, member));
        if (background.type === 'color')
            embed.setColor(background.value);
        else
            embed.setImage(background.value);
        return { content, embeds: [embed], allowedMentions };
    }
    const image = new neekuro_1.default.Welcome()
        .setLayout('center')
        .setAvatar(member.user.displayAvatarURL({ extension: 'png', size: 512 }), {
        border: config.colors?.border ?? '#7289DA'
    })
        .setTitle(renderNotificationTemplate(titleTemplate, member), {
        text_color: config.colors?.title ?? '#FFFFFF'
    })
        .setDescription(renderNotificationTemplate(descriptionTemplate, member), {
        text_color: config.colors?.description ?? '#99AAB5'
    });
    image.setBackground(background.type, background.value);
    const attachment = new discord_js_1.AttachmentBuilder(await image.build(), {
        name: `${kind}.png`,
        description: (0, config_1.text)(locale, `system.004.${kind}.image.description`)
    });
    return { content, files: [attachment], allowedMentions };
}
async function sendConfiguredNotification(kind, member) {
    const config = await getNotificationConfig(kind, member.guild.id);
    if (!config?.channel)
        return;
    const locale = await (0, config_1._locale)(member.guild);
    const channel = member.guild.channels.cache.get(config.channel)
        ?? await member.guild.channels.fetch(config.channel).catch(() => null);
    if (!channel || channel.type !== discord_js_1.ChannelType.GuildText) {
        console.warn(`[Notification:${kind}:WARN] El canal configurado ya no existe o no es textual (${config.channel}).`);
        return;
    }
    const missingPermissions = notificationChannelMissingPermissions(member.guild, channel, config.messageType);
    if (missingPermissions.length > 0) {
        console.warn(`[Notification:${kind}:WARN] Faltan permisos en #${channel.name}: ${missingPermissions.join(', ')}`);
        return;
    }
    await channel.send(await buildNotificationPayload(kind, config, member, locale));
}
function notificationChannelMissingPermissions(guild, channel, messageType = 'message') {
    const me = guild.members.me;
    if (!me)
        return ['ViewChannel', 'SendMessages'];
    const required = [discord_js_1.PermissionFlagsBits.ViewChannel, discord_js_1.PermissionFlagsBits.SendMessages];
    if (messageType === 'embed')
        required.push(discord_js_1.PermissionFlagsBits.EmbedLinks);
    if (messageType === 'image')
        required.push(discord_js_1.PermissionFlagsBits.AttachFiles);
    const permissions = channel.permissionsFor(me);
    return required
        .filter(permission => !permissions?.has(permission))
        .map(permission => permissionName(permission));
}
function isSafeNotificationImageUrl(value) {
    try {
        const url = new URL(value);
        if (url.protocol !== 'https:' || url.username || url.password || url.port)
            return false;
        const host = url.hostname.toLowerCase();
        return host === 'cdn.discordapp.com'
            || host === 'media.discordapp.net'
            || /^images-ext-\d+\.discordapp\.net$/.test(host);
    }
    catch {
        return false;
    }
}
async function showNotificationModal(interaction, kind) {
    const locale = await (0, config_1._locale)(interaction.guild);
    if (!interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild)) {
        await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'system.004.permission.manage_guild'), true);
        return;
    }
    const action = actionByValue[interaction.values[0]];
    if (!action) {
        await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'system.004.option.unknown'), true);
        return;
    }
    const modal = createNotificationModal(kind, action, locale);
    await interaction.showModal(modal);
}
async function handleNotificationModal(interaction, kind, action) {
    const locale = await (0, config_1._locale)(interaction.guild);
    try {
        if (!interaction.guildId || !interaction.guild) {
            await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'system.004.guild_only'), true);
            return;
        }
        if (!interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageGuild)) {
            await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'system.004.permission.manage_guild'), true);
            return;
        }
        const baseId = menuIds[kind];
        if (action === 'type') {
            const selected = interaction.fields.getStringSelectValues(`${baseId}.001`)[0];
            const types = { '1': 'embed', '2': 'image', '3': 'message' };
            const messageType = types[selected];
            if (!messageType) {
                await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'system.004.type.invalid'), true);
                return;
            }
            const current = await getNotificationConfig(kind, interaction.guildId);
            if (current?.channel) {
                const channel = interaction.guild.channels.cache.get(current.channel)
                    ?? await interaction.guild.channels.fetch(current.channel).catch(() => null);
                if (channel?.type === discord_js_1.ChannelType.GuildText) {
                    const missing = notificationChannelMissingPermissions(interaction.guild, channel, messageType);
                    if (missing.length > 0) {
                        await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'system.004.channel.permissions', missing.join(', ')), true);
                        return;
                    }
                }
            }
            await setNotificationValue(kind, interaction.guildId, action, messageType);
            await (0, config_1.send)(interaction, 'ok', (0, config_1.text)(locale, 'system.004.saved.type', (0, config_1.text)(locale, `system.004.type.${messageType}`)), true);
            return;
        }
        if (action === 'channel') {
            const channels = interaction.fields.getSelectedChannels(`${baseId}.002`, true, [discord_js_1.ChannelType.GuildText]);
            const channel = [...channels.values()][0];
            if (!channel || channel.type !== discord_js_1.ChannelType.GuildText) {
                await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'system.004.channel.invalid'), true);
                return;
            }
            const current = await getNotificationConfig(kind, interaction.guildId);
            const missing = notificationChannelMissingPermissions(interaction.guild, channel, current?.messageType);
            if (missing.length > 0) {
                await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'system.004.channel.permissions', missing.join(', ')), true);
                return;
            }
            await setNotificationValue(kind, interaction.guildId, action, channel.id);
            await (0, config_1.send)(interaction, 'ok', (0, config_1.text)(locale, 'system.004.saved.channel', `<#${channel.id}>`), true);
            return;
        }
        if (action === 'background') {
            const selected = interaction.fields.getStringSelectValues(`${baseId}.006`)[0];
            const value = interaction.fields.getTextInputValue(`${baseId}.006.value`).trim();
            if (selected === 'default') {
                const color = value || '#1a1d1f';
                if (!isHexColor(color)) {
                    await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'system.004.color.invalid'), true);
                    return;
                }
                await setNotificationBackground(kind, interaction.guildId, 'color', color);
                await (0, config_1.send)(interaction, 'ok', (0, config_1.text)(locale, 'system.004.saved.background.color', color), true);
                return;
            }
            if (selected === 'custom') {
                if (!isSafeNotificationImageUrl(value)) {
                    await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'system.004.image.invalid'), true);
                    return;
                }
                await setNotificationBackground(kind, interaction.guildId, 'image', value);
                await (0, config_1.send)(interaction, 'ok', (0, config_1.text)(locale, 'system.004.saved.background.image'), true);
                return;
            }
            await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'system.004.option.unknown'), true);
            return;
        }
        if (action === 'colors') {
            const colors = Object.fromEntries(Object.entries({
                title: interaction.fields.getTextInputValue(`${baseId}.007.text`).trim(),
                description: interaction.fields.getTextInputValue(`${baseId}.007.background`).trim(),
                border: interaction.fields.getTextInputValue(`${baseId}.007.border`).trim()
            }).filter(([, value]) => value.length > 0));
            if (Object.keys(colors).length === 0) {
                await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'system.004.colors.required'), true);
                return;
            }
            if (Object.values(colors).some(color => !isHexColor(color))) {
                await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'system.004.color.invalid'), true);
                return;
            }
            await setNotificationColors(kind, interaction.guildId, colors);
            await (0, config_1.send)(interaction, 'ok', (0, config_1.text)(locale, 'system.004.saved.colors'), true);
            return;
        }
        const fieldId = `${baseId}.${action === 'title' ? '003.title' : action === 'description' ? '004.description' : '005.message'}`;
        const value = interaction.fields.getTextInputValue(fieldId).trim();
        if (!value) {
            await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'system.004.value.required'), true);
            return;
        }
        await setNotificationValue(kind, interaction.guildId, action, value);
        await (0, config_1.send)(interaction, 'ok', (0, config_1.text)(locale, `system.004.saved.${action}`), true);
    }
    catch (error) {
        console.error(`[NotificationModal:${kind}:${action}:ERR] No se pudo guardar la configuración:`, error);
        await (0, config_1.send)(interaction, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
function createNotificationModal(kind, action, locale) {
    const baseId = menuIds[kind];
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId(modalIds[kind][action])
        .setTitle((0, config_1.text)(locale, `system.004.modal.${kind}.${action}.title`));
    if (action === 'type') {
        const selector = new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(`${baseId}.001`)
            .setPlaceholder((0, config_1.text)(locale, 'system.004.select.placeholder'))
            .setRequired(true)
            .addOptions(option(locale, 'embed', '1'), option(locale, 'image', '2'), option(locale, 'message', '3'));
        modal.addLabelComponents(new discord_js_1.LabelBuilder()
            .setLabel((0, config_1.text)(locale, 'system.004.select.label'))
            .setStringSelectMenuComponent(selector));
        return modal;
    }
    if (action === 'channel') {
        const selector = new discord_js_1.ChannelSelectMenuBuilder()
            .setCustomId(`${baseId}.002`)
            .setChannelTypes(discord_js_1.ChannelType.GuildText)
            .setPlaceholder((0, config_1.text)(locale, 'system.004.channel.placeholder'))
            .setRequired(true);
        modal.addLabelComponents(new discord_js_1.LabelBuilder()
            .setLabel((0, config_1.text)(locale, 'system.004.channel.label'))
            .setChannelSelectMenuComponent(selector));
        return modal;
    }
    if (action === 'background') {
        const selector = new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(`${baseId}.006`)
            .setPlaceholder((0, config_1.text)(locale, 'system.004.select.placeholder'))
            .setRequired(true)
            .addOptions(new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel((0, config_1.text)(locale, 'system.004.background.color'))
            .setDescription((0, config_1.text)(locale, 'system.004.background.color.description'))
            .setValue('default'), new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel((0, config_1.text)(locale, 'system.004.background.image'))
            .setDescription((0, config_1.text)(locale, 'system.004.background.image.description'))
            .setValue('custom'));
        modal.addLabelComponents(new discord_js_1.LabelBuilder().setLabel((0, config_1.text)(locale, 'system.004.background.label')).setStringSelectMenuComponent(selector), inputLabel(locale, `${baseId}.006.value`, 'background_value', 400, false));
        return modal;
    }
    if (action === 'colors') {
        modal.addLabelComponents(inputLabel(locale, `${baseId}.007.text`, 'color_title', 7, false), inputLabel(locale, `${baseId}.007.background`, 'color_description', 7, false), inputLabel(locale, `${baseId}.007.border`, 'color_border', 7, false));
        return modal;
    }
    const details = {
        title: { id: `${baseId}.003.title`, max: 40, style: discord_js_1.TextInputStyle.Short },
        description: { id: `${baseId}.004.description`, max: 60, style: discord_js_1.TextInputStyle.Short },
        message: { id: `${baseId}.005.message`, max: 400, style: discord_js_1.TextInputStyle.Paragraph }
    }[action];
    modal.addLabelComponents(inputLabel(locale, details.id, action, details.max, true, details.style));
    modal.addTextDisplayComponents(new discord_js_1.TextDisplayBuilder().setContent((0, config_1.text)(locale, 'system.004.parameters.help')));
    return modal;
}
function inputLabel(locale, customId, key, maxLength, required, style = discord_js_1.TextInputStyle.Short) {
    return new discord_js_1.LabelBuilder()
        .setLabel((0, config_1.text)(locale, `system.004.input.${key}.label`))
        .setTextInputComponent(new discord_js_1.TextInputBuilder()
        .setCustomId(customId)
        .setPlaceholder((0, config_1.text)(locale, `system.004.input.${key}.placeholder`))
        .setStyle(style)
        .setMaxLength(maxLength)
        .setRequired(required));
}
function option(locale, type, value) {
    return new discord_js_1.StringSelectMenuOptionBuilder()
        .setLabel((0, config_1.text)(locale, `system.004.type.${type}`))
        .setDescription((0, config_1.text)(locale, `system.004.type.${type}.description`))
        .setValue(value);
}
function safeBackground(background) {
    if (background?.type === 'image' && isSafeNotificationImageUrl(background.value)) {
        return { type: 'image', value: background.value };
    }
    const color = background?.type === 'color' && isHexColor(background.value)
        ? background.value
        : '#1a1d1f';
    return { type: 'color', value: color };
}
function isHexColor(value) {
    return (0, hex_color_regex_1.default)({ strict: true }).test(value);
}
async function setNotificationValue(kind, guildId, action, value) {
    const model = kind === 'welcome' ? Welcome_1.default : Farewell_1.default;
    let result;
    if (action === 'type')
        result = await model.setMessageType(guildId, value);
    else if (action === 'channel')
        result = await model.setChannel(guildId, value);
    else if (action === 'title')
        result = await model.setTitle(guildId, value);
    else if (action === 'description')
        result = await model.setDescription(guildId, value);
    else if (action === 'message')
        result = await model.setMessage(guildId, value);
    else
        throw new Error(`Acción de configuración no soportada: ${action}`);
    notificationCache.delete(`${kind}:${guildId}`);
    return result;
}
async function setNotificationBackground(kind, guildId, type, value) {
    const result = kind === 'welcome'
        ? await Welcome_1.default.setBackground(guildId, type, value)
        : await Farewell_1.default.setBackground(guildId, type, value);
    notificationCache.delete(`${kind}:${guildId}`);
    return result;
}
async function setNotificationColors(kind, guildId, colors) {
    const result = kind === 'welcome'
        ? await Welcome_1.default.setColors(guildId, colors)
        : await Farewell_1.default.setColors(guildId, colors);
    notificationCache.delete(`${kind}:${guildId}`);
    return result;
}
function permissionName(permission) {
    if (permission === discord_js_1.PermissionFlagsBits.ViewChannel)
        return 'ViewChannel';
    if (permission === discord_js_1.PermissionFlagsBits.SendMessages)
        return 'SendMessages';
    if (permission === discord_js_1.PermissionFlagsBits.EmbedLinks)
        return 'EmbedLinks';
    if (permission === discord_js_1.PermissionFlagsBits.AttachFiles)
        return 'AttachFiles';
    return String(permission);
}
