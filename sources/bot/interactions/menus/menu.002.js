"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interaction = void 0;
const discord_js_1 = require("discord.js");
const interaction_data_1 = __importDefault(require("../../structs/interaction_data"));
const command_handler_1 = require("../../config/command_handler");
const config_1 = require("../../config/config");
const help_1 = require("../../structs/help");
const interaction = {
    data: new interaction_data_1.default().setId('menu.002').setUnique(),
    async exec(target) {
        if (!target.isStringSelectMenu())
            return;
        await target.deferUpdate();
        const locale = await (0, config_1._locale)(target.guild);
        try {
            const commands = await (0, command_handler_1.load_commands)();
            const commandId = target.message.embeds[0]?.footer?.text.match(/\d{3}\.\d{3}/)?.[0];
            const command = commands.find(candidate => candidate.data.id === commandId);
            if (!command) {
                await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
                return;
            }
            const embed = new discord_js_1.EmbedBuilder(target.message.embeds[0]?.data).setFields(target.values[0] === '002'
                ? (0, help_1.specificHelpFields)(command, locale)
                : (0, help_1.generalHelpFields)(command, locale));
            await target.message.edit({ embeds: [embed] });
        }
        catch (error) {
            console.error('[HelpCommandMenu:ERR] No se pudo editar el menú:', error);
            await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
        }
    }
};
exports.interaction = interaction;
