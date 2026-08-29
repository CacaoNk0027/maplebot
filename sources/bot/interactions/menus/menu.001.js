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
const Guild_1 = __importDefault(require("../../../shared/bot/models/Guild"));
const interaction = {
    data: new interaction_data_1.default().setId('menu.001').setUnique(),
    async exec(target) {
        if (!target.isStringSelectMenu())
            return;
        await target.deferUpdate();
        const locale = await (0, config_1._locale)(target.guild);
        const category = (0, help_1.helpCategory)(locale, target.values[0]);
        if (!category || !target.guild) {
            await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
            return;
        }
        try {
            const [commands, prefix] = await Promise.all([
                (0, command_handler_1.load_commands)(),
                Guild_1.default.getPrefix(target.guild.id)
            ]);
            const embed = new discord_js_1.EmbedBuilder(target.message.embeds[0]?.data)
                .setTitle(`${category.emoji} | ${category.name}`)
                .setDescription(category.description)
                .setFields({
                name: (0, config_1.text)(locale, 'cmd.001.002.field.commands'),
                value: (0, help_1.commandList)(locale, prefix ?? 'm!', commands, category.id)
            });
            await target.message.edit({ embeds: [embed] });
        }
        catch (error) {
            console.error('[HelpCategoryMenu:ERR] No se pudo editar el menú:', error);
            await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
        }
    }
};
exports.interaction = interaction;
