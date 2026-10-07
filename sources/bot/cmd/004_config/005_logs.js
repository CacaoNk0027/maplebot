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
const log_panel_1 = require("../../structs/log_panel");
const command = {
    data: new command_data_1.default()
        .setName('logs')
        .setAliases('registros', 'log')
        .setId('005', '004')
        .setDescription((0, config_1.text)('es-ES', 'cmd.004.005.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.004.005.description'))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild)
        .setBotPermissions('EmbedLinks')
        .setUserPermissions('ManageGuild')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5),
    async exec(interaction) {
        await response(interaction);
    },
    async message(message) {
        await response(message);
    }
};
exports.command = command;
async function response(target) {
    const locale = await (0, moderation_1.moderationLocale)(target);
    if (!await (0, moderation_1.ensureModerationPermissions)(target, locale, ['ManageGuild'], ['EmbedLinks']))
        return;
    try {
        await (0, log_panel_1.openLogPanel)(target);
    }
    catch (error) {
        console.error('[CommandLogs:ERR] No se pudo abrir el panel de registros:', error);
        await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
