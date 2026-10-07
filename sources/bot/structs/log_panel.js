"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openLogPanel = openLogPanel;
exports.handleCategorySelect = handleCategorySelect;
exports.handleEventSelect = handleEventSelect;
exports.handleLogChannelSelect = handleLogChannelSelect;
exports.handleToggleButton = handleToggleButton;
exports.handleUseDefaultButton = handleUseDefaultButton;
exports.handleCloseButton = handleCloseButton;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const moderation_1 = require("./moderation");
const log_dispatch_1 = require("./log_dispatch");
const Logs_1 = __importDefault(require("../../shared/bot/models/Logs"));
const log_events_1 = require("../../shared/config/log_events");
const CHANNEL_PERMISSIONS = ['ViewChannel', 'SendMessages', 'EmbedLinks'];
function encode(state) {
    return `${state.ownerId}:${state.category}:${state.event ?? '-'}`;
}
function decode(customId) {
    const [, ownerId, category, event] = customId.split(':');
    return {
        ownerId: ownerId ?? '',
        category: log_events_1.LOG_CATEGORIES.includes(category ?? '')
            ? category
            : log_events_1.LOG_CATEGORIES[0],
        event: event && event !== '-' && (0, log_events_1.isLogEventKey)(event) ? event : null
    };
}
async function openLogPanel(caller) {
    const locale = await (0, moderation_1.moderationLocale)(caller);
    const state = {
        ownerId: caller instanceof discord_js_1.Message ? caller.author.id : caller.user.id,
        category: log_events_1.LOG_CATEGORIES[0],
        event: null
    };
    await caller.reply(await panel(caller.guild, locale, state));
}
async function handleCategorySelect(interaction) {
    const state = decode(interaction.customId);
    const locale = await (0, moderation_1.moderationLocale)(interaction);
    const category = interaction.values[0];
    await interaction.update(await panel(interaction.guild, locale, {
        ...state,
        category,
        event: null
    }));
}
async function handleEventSelect(interaction) {
    const state = decode(interaction.customId);
    const locale = await (0, moderation_1.moderationLocale)(interaction);
    const value = interaction.values[0];
    await interaction.update(await panel(interaction.guild, locale, {
        ...state,
        event: (0, log_events_1.isLogEventKey)(value) ? value : null
    }));
}
/**
 * El selector de canal cambia el canal del evento elegido, o el canal por
 * defecto del servidor si no hay ninguno seleccionado.
 */
async function handleLogChannelSelect(interaction) {
    const state = decode(interaction.customId);
    const locale = await (0, moderation_1.moderationLocale)(interaction);
    const channel = await interaction.guild.channels.fetch(interaction.values[0]).catch(() => null);
    if (!channel || ![discord_js_1.ChannelType.GuildText, discord_js_1.ChannelType.GuildAnnouncement].includes(channel.type)) {
        await interaction.reply({ content: (0, config_1.text)(locale, 'cmd.004.005.channel_invalid'), ephemeral: true });
        return;
    }
    const missing = missingPermissions(channel);
    if (missing.length) {
        await interaction.reply({
            content: (0, config_1.text)(locale, 'cmd.004.005.channel_permissions', missing.join(', ')),
            ephemeral: true
        });
        return;
    }
    // Se confirma antes de escribir: guardar implica una transacción contra
    // Atlas y Discord invalida la interacción a los 3 s. Sin esto el ajuste se
    // aplicaba pero el panel ya no se podía actualizar.
    await interaction.deferUpdate();
    if (state.event) {
        await Logs_1.default.setEvent(interaction.guildId, state.event, { channel: channel.id, enabled: true });
    }
    else {
        await Logs_1.default.setDefaultChannel(interaction.guildId, channel.id);
    }
    (0, log_dispatch_1.clearLogCache)(interaction.guildId);
    await interaction.editReply(await panel(interaction.guild, locale, state));
}
async function handleToggleButton(interaction) {
    const state = decode(interaction.customId);
    const locale = await (0, moderation_1.moderationLocale)(interaction);
    if (!state.event) {
        await interaction.reply({ content: (0, config_1.text)(locale, 'cmd.004.005.select_event'), ephemeral: true });
        return;
    }
    await interaction.deferUpdate();
    const settings = await (0, log_dispatch_1.getLogSettings)(interaction.guildId);
    const enabled = settings?.events[state.event]?.enabled ?? false;
    await Logs_1.default.setEvent(interaction.guildId, state.event, { enabled: !enabled });
    (0, log_dispatch_1.clearLogCache)(interaction.guildId);
    await interaction.editReply(await panel(interaction.guild, locale, state));
}
/** Devuelve un evento al canal por defecto, quitándole el suyo propio. */
async function handleUseDefaultButton(interaction) {
    const state = decode(interaction.customId);
    const locale = await (0, moderation_1.moderationLocale)(interaction);
    if (!state.event) {
        await interaction.reply({ content: (0, config_1.text)(locale, 'cmd.004.005.select_event'), ephemeral: true });
        return;
    }
    await interaction.deferUpdate();
    await Logs_1.default.setEvent(interaction.guildId, state.event, { channel: null });
    (0, log_dispatch_1.clearLogCache)(interaction.guildId);
    await interaction.editReply(await panel(interaction.guild, locale, state));
}
async function handleCloseButton(interaction) {
    const locale = await (0, moderation_1.moderationLocale)(interaction);
    await interaction.update({
        content: (0, config_1.text)(locale, 'cmd.004.005.closed'),
        embeds: [],
        components: []
    });
}
async function panel(guild, locale, state) {
    const settings = await (0, log_dispatch_1.getLogSettings)(guild.id);
    const encoded = encode(state);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Blurple)
        .setTitle((0, config_1.text)(locale, 'cmd.004.005.panel.title'))
        .setDescription((0, config_1.text)(locale, 'cmd.004.005.panel.default_channel', settings?.defaultChannel ? `<#${settings.defaultChannel}>` : (0, config_1.text)(locale, 'cmd.004.005.panel.none')))
        .addFields({
        name: (0, config_1.text)(locale, (0, log_events_1.categoryLabelKey)(state.category)),
        value: (0, log_events_1.eventsByCategory)(state.category).map(key => {
            const event = settings?.events[key];
            const enabled = event?.enabled ?? log_events_1.LOG_EVENTS[key].enabledByDefault;
            const own = event?.channel ? ` · <#${event.channel}>` : '';
            const marker = state.event === key ? '▸ ' : '';
            return `${marker}${enabled ? '🟢' : '🔴'} ${(0, config_1.text)(locale, (0, log_events_1.eventLabelKey)(key))}${own}`;
        }).join('\n')
    })
        .setFooter({ text: (0, config_1.text)(locale, 'cmd.004.005.panel.hint') });
    if ((0, log_events_1.eventsByCategory)(state.category).some(key => log_events_1.LOG_EVENTS[key].needsMessageContent)) {
        embed.addFields({
            name: (0, config_1.text)(locale, 'cmd.004.005.panel.notice'),
            value: (0, config_1.text)(locale, 'cmd.004.005.panel.intent')
        });
    }
    const categories = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId(`menu.009:${encoded}`)
        .setPlaceholder((0, config_1.text)(locale, 'cmd.004.005.category.placeholder'))
        .addOptions(log_events_1.LOG_CATEGORIES.map(category => ({
        label: (0, config_1.text)(locale, (0, log_events_1.categoryLabelKey)(category)),
        value: category,
        default: category === state.category
    })));
    const events = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId(`menu.010:${encoded}`)
        .setPlaceholder((0, config_1.text)(locale, 'cmd.004.005.event.placeholder'))
        .addOptions((0, log_events_1.eventsByCategory)(state.category).map(key => ({
        label: (0, config_1.text)(locale, (0, log_events_1.eventLabelKey)(key)),
        description: (0, config_1.text)(locale, (0, log_events_1.eventHintKey)(key)),
        value: key,
        default: key === state.event
    })));
    const channels = new discord_js_1.ChannelSelectMenuBuilder()
        .setCustomId(`menu.011:${encoded}`)
        .setPlaceholder((0, config_1.text)(locale, state.event ? 'cmd.004.005.channel.event_placeholder' : 'cmd.004.005.channel.default_placeholder'))
        .addChannelTypes(discord_js_1.ChannelType.GuildText, discord_js_1.ChannelType.GuildAnnouncement);
    const current = state.event ? settings?.events[state.event] : null;
    const buttons = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`button.003:${encoded}`)
        .setStyle(current?.enabled ? discord_js_1.ButtonStyle.Danger : discord_js_1.ButtonStyle.Success)
        .setDisabled(!state.event)
        .setLabel((0, config_1.text)(locale, current?.enabled ? 'cmd.004.005.button.disable' : 'cmd.004.005.button.enable')), new discord_js_1.ButtonBuilder()
        .setCustomId(`button.004:${encoded}`)
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(!state.event || !current?.channel)
        .setLabel((0, config_1.text)(locale, 'cmd.004.005.button.use_default')), new discord_js_1.ButtonBuilder()
        .setCustomId(`button.005:${encoded}`)
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setLabel((0, config_1.text)(locale, 'cmd.004.005.button.close')));
    return {
        embeds: [embed],
        components: [
            new discord_js_1.ActionRowBuilder().addComponents(categories),
            new discord_js_1.ActionRowBuilder().addComponents(events),
            new discord_js_1.ActionRowBuilder().addComponents(channels),
            buttons
        ]
    };
}
function missingPermissions(channel) {
    const me = channel.guild.members.me;
    if (!me)
        return [...CHANNEL_PERMISSIONS];
    const permissions = channel.permissionsFor(me);
    return CHANNEL_PERMISSIONS.filter(permission => !permissions?.has(permission));
}
