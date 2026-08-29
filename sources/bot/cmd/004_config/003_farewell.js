"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../config/config");
const member_notifications_1 = require("../../config/member_notifications");
const command = {
    data: new command_data_1.default()
        .setName('farewell')
        .setAliases('despedida', 'set-farewell', 'setfrw', 'frw')
        .setId('003', '004')
        .setDescription('Configura el sistema de despedidas')
        .setDescriptionLocalization('en-US', 'Configures the farewell system')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild)
        .setUserPermissions('ManageGuild')
        .setBotPermissions('AttachFiles')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(3)
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('configure')
        .setNameLocalization('es-ES', 'configurar')
        .setDescription('Abre el menú de configuración')
        .setDescriptionLocalization('en-US', 'Opens the configuration menu'))
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('test')
        .setDescription('Prueba la configuración actual')
        .setDescriptionLocalization('en-US', 'Tests the current configuration')),
    async exec(interaction) {
        await response(interaction, interaction.options.getSubcommand());
    },
    async message(message, args) {
        await response(message, args[0]);
    }
};
exports.command = command;
async function response(caller, action) {
    const locale = await (0, config_1._locale)(caller.guild);
    try {
        if (action?.toLowerCase() === 'test')
            await (0, member_notifications_1.showNotificationPreview)(caller, 'farewell');
        else
            await (0, member_notifications_1.showNotificationConfiguration)(caller, 'farewell');
    }
    catch (error) {
        console.error('[CommandFarewell:ERR] No se pudo procesar el sistema de despedidas:', error);
        await (0, config_1.send)(caller, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
