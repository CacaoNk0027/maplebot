"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const command_handler_1 = require("../../config/command_handler");
const config_1 = require("../../config/config");
const help_1 = require("../../structs/help");
const emojis_1 = require("../../../shared/config/emojis");
const command = {
    data: new command_data_1.default()
        .setName('help')
        .setId('002', '001')
        .setAliases('h', 'ayuda')
        .setDescription((0, config_1.text)('es-ES', 'cmd.001.002.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.001.002.description'))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('command')
        .setDescription((0, config_1.text)('es-ES', 'cmd.001.002.command_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.001.002.command_option'))),
    async exec(interaction) {
        await response(interaction, interaction.options.getString('command'));
    },
    async message(message, args) {
        await response(message, args[0]);
    }
};
exports.command = command;
async function response(target, name) {
    const locale = await (0, config_1._locale)(target.guild);
    if (!name) {
        await showMenu(target, locale);
        return;
    }
    const commands = await (0, command_handler_1.load_commands)();
    const identifier = name.toLowerCase();
    const entry = commands.get(identifier)
        ?? commands.find(candidate => candidate.data.alias.some(alias => alias.toLowerCase() === identifier)
            || candidate.data.id === identifier);
    if (!entry) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'cmd.001.002.command_not_found', name), true);
        return;
    }
    await showCommand(target, entry, locale);
}
async function showMenu(target, locale) {
    const actorId = target instanceof discord_js_1.Message ? target.author.id : target.user.id;
    const categories = (0, help_1.helpCategories)(locale);
    await target.reply({
        embeds: [{
                author: {
                    name: target.client.user?.username ?? '',
                    icon_url: target.client.user?.avatarURL() ?? ''
                },
                color: config_1.theme_color,
                title: `${emojis_1.EMOJI.tea} | ${(0, config_1.text)(locale, 'cmd.001.002.menu.title')}`,
                description: (0, config_1.text)(locale, 'cmd.001.002.menu.description'),
                fields: [{
                        name: `${emojis_1.EMOJI.wink} | ${(0, config_1.text)(locale, 'cmd.001.002.menu.support.name')}`,
                        value: (0, config_1.text)(locale, 'cmd.001.002.menu.support.value')
                    }]
            }],
        components: [{
                type: discord_js_1.ComponentType.ActionRow,
                components: [{
                        type: discord_js_1.ComponentType.StringSelect,
                        custom_id: `menu.001:${actorId}`,
                        placeholder: (0, config_1.text)(locale, 'cmd.001.002.menu.placeholder'),
                        options: categories.map(category => ({
                            label: category.name,
                            value: category.id,
                            description: category.description,
                            emoji: (0, help_1.selectEmoji)(category.emoji)
                        }))
                    }]
            }]
    });
}
async function showCommand(target, entry, locale) {
    const actorId = target instanceof discord_js_1.Message ? target.author.id : target.user.id;
    await target.reply({
        embeds: [{
                author: {
                    name: target.client.user.username,
                    icon_url: target.client.user.avatarURL() ?? ''
                },
                color: entry.data.inactive ? discord_js_1.Colors.Red : config_1.theme_color,
                title: (0, config_1.text)(locale, 'cmd.001.002.command.title', entry.data.name),
                description: (0, help_1.localizedCommandDescription)(entry, locale),
                fields: (0, help_1.generalHelpFields)(entry, locale),
                footer: { text: `ID | ${entry.data.id}` }
            }],
        components: [{
                type: discord_js_1.ComponentType.ActionRow,
                components: [{
                        type: discord_js_1.ComponentType.StringSelect,
                        custom_id: `menu.002:${actorId}`,
                        placeholder: (0, config_1.text)(locale, 'cmd.001.002.details.placeholder'),
                        options: [{
                                label: (0, config_1.text)(locale, 'cmd.001.002.details.general.label'),
                                value: '001',
                                description: (0, config_1.text)(locale, 'cmd.001.002.details.general.description'),
                                emoji: { name: '📄' }
                            }, {
                                label: (0, config_1.text)(locale, 'cmd.001.002.details.specific.label'),
                                value: '002',
                                description: (0, config_1.text)(locale, 'cmd.001.002.details.specific.description'),
                                emoji: { name: '📍' }
                            }]
                    }]
            }]
    });
}
