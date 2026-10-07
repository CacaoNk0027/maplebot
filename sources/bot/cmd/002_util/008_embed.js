"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../config/config");
const embed_builder_1 = require("../../structs/embed_builder");
const command = {
    data: new command_data_1.default()
        .setName('embed')
        .setAliases('embeds', 'incrustado')
        .setId('008', '002')
        .setDescription((0, config_1.text)('es-ES', 'cmd.002.008.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.002.008.description'))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageMessages)
        .setUserPermissions('ManageMessages')
        .setBotPermissions('EmbedLinks')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('message')
        .setNameLocalization('es-ES', 'mensaje')
        .setDescription((0, config_1.text)('es-ES', 'cmd.002.008.message_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.002.008.message_option'))),
    async exec(interaction) {
        await (0, embed_builder_1.openEmbedBuilder)(interaction);
    },
    async message(message, args) {
        await (0, embed_builder_1.openEmbedBuilder)(message, args);
    }
};
exports.command = command;
