"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../config/config");
const moderation_1 = require("../../structs/moderation");
const automod_1 = require("../../structs/automod");
const pagination_1 = require("../../structs/pagination");
const Infraction_1 = __importDefault(require("../../../shared/bot/models/Infraction"));
const HISTORY_LIMIT = 10;
const OFFENDERS_LIMIT = 5;
const command = {
    data: new command_data_1.default()
        .setName('infractions')
        .setAliases('infracciones', 'historial')
        .setId('009', '003')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.009.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.009.description'))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ModerateMembers)
        .setUserPermissions('ModerateMembers')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('user')
        .setNameLocalization('es-ES', 'usuario')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.009.user.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.009.user.description'))
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setNameLocalization('es-ES', 'usuario')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.009.user_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.009.user_option'))
        .setRequired(true)))
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('server')
        .setNameLocalization('es-ES', 'servidor')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.009.server.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.009.server.description'))),
    async exec(interaction) {
        await response(interaction);
    },
    async message(message, args) {
        await response(message, args);
    }
};
exports.command = command;
async function response(target, args = []) {
    const locale = await (0, moderation_1.moderationLocale)(target);
    if (!await (0, moderation_1.ensureModerationPermissions)(target, locale, ['ModerateMembers'], []))
        return;
    try {
        const operation = target instanceof discord_js_1.ChatInputCommandInteraction
            ? target.options.getSubcommand()
            : normalizeOperation(args);
        if (operation === 'server') {
            await showGuildSummary(target, locale);
            return;
        }
        const user = await resolveUser(target, args);
        if (!user) {
            await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.009.user_required'), true);
            return;
        }
        await showUserHistory(target, user, locale);
    }
    catch (error) {
        console.error('[CommandInfractions:ERR] No se pudo consultar el historial:', error);
        await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
function normalizeOperation(args) {
    const first = args[0]?.toLocaleLowerCase();
    if (!first)
        return 'server';
    if (['server', 'servidor', 'resumen'].includes(first))
        return 'server';
    return 'user';
}
async function showUserHistory(target, user, locale) {
    const guildId = target.guildId;
    const total = await Infraction_1.default.countByUser(guildId, user.id);
    if (!total) {
        await (0, config_1.send)(target, 'info', (0, config_1.text)(locale, 'cmd.003.009.user_empty', (0, discord_js_1.escapeMarkdown)(user.tag)), true);
        return;
    }
    const totalPages = Math.ceil(total / HISTORY_LIMIT);
    await (0, pagination_1.sendPaginatedEmbed)({
        target,
        locale,
        totalPages,
        customId: `infractions-${user.id}`,
        render: async (page) => {
            const entries = await Infraction_1.default.listByUser(guildId, user.id, HISTORY_LIMIT, page * HISTORY_LIMIT);
            const lines = entries.map((entry, index) => {
                const position = page * HISTORY_LIMIT + index + 1;
                const when = (0, discord_js_1.time)(entry.createdAt, 'R');
                if (entry.source === 'manual') {
                    const action = (0, config_1.text)(locale, `cmd.003.009.manual.${entry.action ?? 'ban'}`);
                    const moderator = entry.moderatorId ? ` · <@${entry.moderatorId}>` : '';
                    const reason = entry.reason
                        ? `\n${(0, discord_js_1.escapeMarkdown)(truncate(entry.reason, 80))}`
                        : '';
                    return `**${position}.** ${when} — **${action}**${moderator}${reason}`;
                }
                const trigger = entry.triggerType
                    ? (0, config_1.text)(locale, (0, automod_1.autoModTriggerKey)(entry.triggerType))
                    : (0, config_1.text)(locale, 'system.003.automod.log.unknown');
                const ruleName = entry.ruleName
                    ? (0, discord_js_1.escapeMarkdown)(entry.ruleName)
                    : (0, config_1.text)(locale, 'system.003.automod.log.unknown');
                const matched = entry.matched
                    ? ` · ${(0, discord_js_1.inlineCode)(truncate(entry.matched, 60))}`
                    : '';
                return `**${position}.** ${when} — **${ruleName}**\n${trigger}${matched}`;
            });
            return new discord_js_1.EmbedBuilder()
                .setColor(discord_js_1.Colors.Orange)
                .setTitle((0, config_1.text)(locale, 'cmd.003.009.user_title', (0, discord_js_1.escapeMarkdown)(user.tag)))
                .setDescription(lines.join('\n\n'))
                .setThumbnail(user.displayAvatarURL())
                .setFooter({ text: (0, config_1.text)(locale, 'cmd.003.009.user_footer', total) });
        }
    });
}
async function showGuildSummary(target, locale) {
    const guildId = target.guildId;
    const [total, offenders] = await Promise.all([
        Infraction_1.default.countByGuild(guildId),
        Infraction_1.default.topOffenders(guildId, OFFENDERS_LIMIT)
    ]);
    if (!total) {
        await (0, config_1.send)(target, 'info', (0, config_1.text)(locale, 'cmd.003.009.server_empty'), true);
        return;
    }
    const lines = offenders.map((offender, index) => `**${index + 1}.** <@${offender.userId}> — ${(0, config_1.text)(locale, 'cmd.003.009.count', offender.total)}`);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(discord_js_1.Colors.Orange)
        .setTitle((0, config_1.text)(locale, 'cmd.003.009.server_title'))
        .setDescription(lines.join('\n'))
        .setFooter({ text: (0, config_1.text)(locale, 'cmd.003.009.server_footer', total) });
    await replyWithEmbed(target, embed);
}
async function resolveUser(target, args) {
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        return target.options.getUser('user');
    }
    const mentioned = target.mentions.users.first();
    if (mentioned)
        return mentioned;
    const id = args.map(extractSnowflake).find((value) => Boolean(value));
    if (!id)
        return null;
    return await target.client.users.fetch(id).catch(() => null);
}
async function replyWithEmbed(target, embed) {
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        await target.reply({ embeds: [embed], flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    await target.reply({ embeds: [embed] });
}
function truncate(value, limit) {
    return value.length <= limit ? value : `${value.slice(0, limit - 3)}...`;
}
function extractSnowflake(value) {
    if (!value)
        return null;
    return value.match(/\d{16,22}/)?.[0] ?? null;
}
