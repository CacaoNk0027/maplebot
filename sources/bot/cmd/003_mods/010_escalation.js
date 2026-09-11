"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../config/config");
const moderation_1 = require("../../structs/moderation");
const automod_escalation_1 = require("../../structs/automod_escalation");
const Escalation_1 = __importStar(require("../../../shared/bot/models/Escalation"));
const command = {
    data: new command_data_1.default()
        .setName('escalation')
        .setAliases('escalado', 'sanciones')
        .setId('010', '003')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.010.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.010.description'))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild)
        .setBotPermissions('ModerateMembers')
        .setUserPermissions('ManageGuild')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('status')
        .setNameLocalization('es-ES', 'estado')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.010.status.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.010.status.description')))
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('enable')
        .setNameLocalization('es-ES', 'activar')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.010.enable.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.010.enable.description')))
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('disable')
        .setNameLocalization('es-ES', 'desactivar')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.010.disable.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.010.disable.description')))
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('set')
        .setNameLocalization('es-ES', 'definir')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.010.set.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.010.set.description'))
        .addIntegerOption(new discord_js_1.SlashCommandIntegerOption()
        .setName('threshold')
        .setNameLocalization('es-ES', 'umbral')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.010.threshold_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.010.threshold_option'))
        .setMinValue(1)
        .setMaxValue(1000)
        .setRequired(true))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('action')
        .setNameLocalization('es-ES', 'accion')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.010.action_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.010.action_option'))
        .addChoices({ name: 'warn', value: 'warn' }, { name: 'timeout', value: 'timeout' })
        .setRequired(true))
        .addIntegerOption(new discord_js_1.SlashCommandIntegerOption()
        .setName('minutes')
        .setNameLocalization('es-ES', 'minutos')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.010.minutes_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.010.minutes_option'))
        .setMinValue(1)
        .setMaxValue(Escalation_1.MAX_TIMEOUT_MINUTES)))
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('remove')
        .setNameLocalization('es-ES', 'quitar')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.010.remove.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.010.remove.description'))
        .addIntegerOption(new discord_js_1.SlashCommandIntegerOption()
        .setName('threshold')
        .setNameLocalization('es-ES', 'umbral')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.010.threshold_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.010.threshold_option'))
        .setMinValue(1)
        .setMaxValue(1000)
        .setRequired(true)))
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('window')
        .setNameLocalization('es-ES', 'ventana')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.010.window.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.010.window.description'))
        .addIntegerOption(new discord_js_1.SlashCommandIntegerOption()
        .setName('days')
        .setNameLocalization('es-ES', 'dias')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.010.days_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.010.days_option'))
        .setMinValue(1)
        .setMaxValue(90)
        .setRequired(true)))
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('reset')
        .setNameLocalization('es-ES', 'restaurar')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.010.reset.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.010.reset.description'))),
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
    if (!await (0, moderation_1.ensureModerationPermissions)(target, locale, ['ManageGuild'], ['ManageGuild']))
        return;
    try {
        const operation = target instanceof discord_js_1.ChatInputCommandInteraction
            ? target.options.getSubcommand()
            : normalizeOperation(args[0]);
        switch (operation) {
            case 'status':
                await showStatus(target, locale);
                return;
            case 'enable':
                await toggle(target, true, locale);
                return;
            case 'disable':
                await toggle(target, false, locale);
                return;
            case 'set':
                await setStep(target, args, locale);
                return;
            case 'remove':
                await removeStep(target, args, locale);
                return;
            case 'window':
                await setWindow(target, args, locale);
                return;
            case 'reset':
                await resetSteps(target, locale);
                return;
            default:
                await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.010.operation_required'), true);
        }
    }
    catch (error) {
        console.error('[CommandEscalation:ERR] No se pudo consultar o cambiar el escalado:', error);
        await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
function normalizeOperation(value) {
    const normalized = value?.toLocaleLowerCase();
    if (!normalized)
        return 'status';
    if (['estado', 'resumen'].includes(normalized))
        return 'status';
    if (['activar', 'habilitar'].includes(normalized))
        return 'enable';
    if (['desactivar', 'deshabilitar'].includes(normalized))
        return 'disable';
    if (['definir', 'establecer'].includes(normalized))
        return 'set';
    if (['quitar', 'eliminar'].includes(normalized))
        return 'remove';
    if (['ventana'].includes(normalized))
        return 'window';
    if (['restaurar', 'reiniciar'].includes(normalized))
        return 'reset';
    return normalized;
}
async function showStatus(target, locale) {
    const settings = await (0, automod_escalation_1.getEscalationSettings)(target.guildId)
        ?? { enabled: false, windowDays: 7, steps: [] };
    const lines = settings.steps.length
        ? settings.steps.map(step => {
            const action = (0, config_1.text)(locale, `system.003.escalation.action.${step.action}`);
            const duration = step.action === 'timeout' && step.minutes
                ? ` · ${(0, config_1.text)(locale, 'cmd.003.010.minutes_value', step.minutes)}`
                : '';
            return `**${step.threshold}** → ${action}${duration}`;
        })
        : [(0, config_1.text)(locale, 'cmd.003.010.no_steps')];
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(settings.enabled ? discord_js_1.Colors.Green : discord_js_1.Colors.Grey)
        .setTitle((0, config_1.text)(locale, 'cmd.003.010.status.title'))
        .setDescription(lines.join('\n'))
        .addFields({
        name: (0, config_1.text)(locale, 'cmd.003.010.status.state'),
        value: (0, config_1.text)(locale, settings.enabled
            ? 'cmd.003.010.enabled_value'
            : 'cmd.003.010.disabled_value'),
        inline: true
    }, {
        name: (0, config_1.text)(locale, 'cmd.003.010.status.window'),
        value: (0, config_1.text)(locale, 'cmd.003.010.days_value', settings.windowDays),
        inline: true
    });
    await replyWithEmbed(target, embed);
}
async function toggle(target, enabled, locale) {
    await Escalation_1.default.setEnabled(target.guildId, enabled);
    (0, automod_escalation_1.clearEscalationCache)(target.guildId);
    await (0, config_1.send)(target, 'ok', (0, config_1.text)(locale, enabled ? 'cmd.003.010.enabled' : 'cmd.003.010.disabled'), true);
}
async function setStep(target, args, locale) {
    const threshold = target instanceof discord_js_1.ChatInputCommandInteraction
        ? target.options.getInteger('threshold')
        : parseInteger(args[1]);
    const action = (target instanceof discord_js_1.ChatInputCommandInteraction
        ? target.options.getString('action')
        : args[2]?.toLocaleLowerCase());
    const minutes = target instanceof discord_js_1.ChatInputCommandInteraction
        ? target.options.getInteger('minutes')
        : parseInteger(args[3]);
    if (!threshold || threshold < 1 || threshold > 1000) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.010.threshold_invalid'), true);
        return;
    }
    if (action !== 'warn' && action !== 'timeout') {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.010.action_invalid'), true);
        return;
    }
    if (action === 'timeout' && (!minutes || minutes < 1 || minutes > Escalation_1.MAX_TIMEOUT_MINUTES)) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.010.minutes_invalid'), true);
        return;
    }
    await Escalation_1.default.setStep(target.guildId, { threshold, action, minutes });
    (0, automod_escalation_1.clearEscalationCache)(target.guildId);
    await (0, config_1.send)(target, 'ok', (0, config_1.text)(locale, 'cmd.003.010.step_saved', threshold), true);
}
async function removeStep(target, args, locale) {
    const threshold = target instanceof discord_js_1.ChatInputCommandInteraction
        ? target.options.getInteger('threshold')
        : parseInteger(args[1]);
    if (!threshold) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.010.threshold_invalid'), true);
        return;
    }
    await Escalation_1.default.removeStep(target.guildId, threshold);
    (0, automod_escalation_1.clearEscalationCache)(target.guildId);
    await (0, config_1.send)(target, 'ok', (0, config_1.text)(locale, 'cmd.003.010.step_removed', threshold), true);
}
async function setWindow(target, args, locale) {
    const days = target instanceof discord_js_1.ChatInputCommandInteraction
        ? target.options.getInteger('days')
        : parseInteger(args[1]);
    if (!days || days < 1 || days > 90) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.003.010.days_invalid'), true);
        return;
    }
    await Escalation_1.default.setWindow(target.guildId, days);
    (0, automod_escalation_1.clearEscalationCache)(target.guildId);
    await (0, config_1.send)(target, 'ok', (0, config_1.text)(locale, 'cmd.003.010.window_saved', days), true);
}
async function resetSteps(target, locale) {
    await Escalation_1.default.resetSteps(target.guildId);
    (0, automod_escalation_1.clearEscalationCache)(target.guildId);
    await (0, config_1.send)(target, 'ok', (0, config_1.text)(locale, 'cmd.003.010.reset_done'), true);
}
async function replyWithEmbed(target, embed) {
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        await target.reply({ embeds: [embed], flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    await target.reply({ embeds: [embed] });
}
function parseInteger(value) {
    if (!value?.trim())
        return null;
    const parsed = Number(value.trim());
    return Number.isInteger(parsed) ? parsed : null;
}
