"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaginatedEmbed = sendPaginatedEmbed;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const PAGINATION_TIME = 120_000;
/**
 * Envía un embed paginado con botones de anterior y siguiente.
 *
 * Si solo hay una página se responde sin componentes, para no dejar botones
 * inertes en pantalla.
 */
async function sendPaginatedEmbed(options) {
    const { target, locale, totalPages, customId, render, ephemeral = true } = options;
    const useEphemeral = ephemeral && target instanceof discord_js_1.ChatInputCommandInteraction;
    let page = 0;
    const embed = await render(page);
    if (totalPages <= 1) {
        await replyWith(target, { embeds: [embed], components: [] }, useEphemeral);
        return;
    }
    const ownerId = target instanceof discord_js_1.Message ? target.author.id : target.user.id;
    let message;
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        await target.reply({
            embeds: [embed],
            components: [buildRow(customId, page, totalPages, locale)],
            ...(useEphemeral ? { flags: discord_js_1.MessageFlags.Ephemeral } : {})
        });
        message = await target.fetchReply();
    }
    else {
        message = await target.reply({
            embeds: [embed],
            components: [buildRow(customId, page, totalPages, locale)]
        });
    }
    const collector = message.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
        time: PAGINATION_TIME
    });
    collector.on('collect', async (interaction) => {
        if (interaction.user.id !== ownerId) {
            await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'interaction.menu.owner'), true);
            return;
        }
        page = interaction.customId.endsWith('-next')
            ? Math.min(page + 1, totalPages - 1)
            : Math.max(page - 1, 0);
        try {
            const current = await render(page);
            await interaction.update({
                embeds: [current],
                components: [buildRow(customId, page, totalPages, locale)]
            });
        }
        catch (error) {
            console.error('[Pagination:ERR] No se pudo cambiar de página:', error);
            collector.stop('failed');
        }
    });
    collector.on('end', async (_, reason) => {
        if (reason === 'failed')
            return;
        await clearComponents(target, message).catch(error => {
            console.warn('[Pagination:WARN] No se pudieron retirar los botones:', error);
        });
    });
}
function buildRow(customId, page, totalPages, locale) {
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`${customId}-previous`)
        .setLabel((0, config_1.text)(locale, 'system.pagination.previous'))
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(page === 0), new discord_js_1.ButtonBuilder()
        .setCustomId(`${customId}-page`)
        .setLabel((0, config_1.text)(locale, 'system.pagination.page', page + 1, totalPages))
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(true), new discord_js_1.ButtonBuilder()
        .setCustomId(`${customId}-next`)
        .setLabel((0, config_1.text)(locale, 'system.pagination.next'))
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(page >= totalPages - 1));
}
async function replyWith(target, payload, ephemeral) {
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        await target.reply({ ...payload, ...(ephemeral ? { flags: discord_js_1.MessageFlags.Ephemeral } : {}) });
        return;
    }
    await target.reply(payload);
}
async function clearComponents(target, message) {
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        await target.editReply({ components: [] });
        return;
    }
    await message.edit({ components: [] });
}
