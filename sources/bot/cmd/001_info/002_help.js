"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const command_handler_1 = require("../../../bot/config/command_handler");
const config_1 = require("../../../bot/config/config");
const menus_json_1 = __importDefault(require("../../../shared/bot/assets/json/menus.json"));
const command = {
    data: new command_data_1.default()
        .setName('help')
        .setId('002', '001')
        .setAliases('h', 'ayuda')
        .setDescription('Da un menu de ayuda interactivo')
        .setDescriptionLocalization('en-US', 'Give an interactive help menu')
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('command')
        .setDescription('Escribe un comando para desplegar un cuadro de información')
        .setDescriptionLocalization('en-US', 'Type a command to display an information box')),
    async exec(interaction) {
        let commands = await (0, command_handler_1.load_commands)();
        let identifier = interaction.options.getString('command');
        if (!identifier) {
            await menús(interaction.client, interaction);
            return;
        }
        let command = commands.get(identifier.toLowerCase()) || commands.find(cmd => cmd.data.alias.includes(identifier.toLowerCase())) || commands.find(cmd => cmd.data.id === identifier.toLowerCase());
        if (!command) {
            await menús(interaction.client, interaction);
            return;
        }
        await interaction.reply({
            embeds: [{
                    author: {
                        name: interaction.client.user.username,
                        icon_url: interaction.client.user.avatarURL() || ''
                    },
                    color: command.data.inactive ? discord_js_1.Colors.Red : config_1.theme_color,
                    description: command.data.description,
                    fields: [{
                            name: 'Alias',
                            value: (0, config_1.code_text)(command.data.alias.join(', ') || 'Sin alias')
                        }, {
                            name: 'Categoría',
                            value: (0, config_1.code_text)(menus_json_1.default.find(menu => menu.id === command.data.category)?.name || 'Sin categoría'),
                            inline: true
                        }, {
                            name: 'Filtro nsfw',
                            value: (0, config_1.code_text)(command.data.nsfw ? '- Activo' : '+ Inactivo', 'diff'),
                            inline: true
                        }, {
                            name: 'Cooldown',
                            value: (0, config_1.code_text)(command.data.cooldown ? `${command.data.cooldown} segundos` : 'Sin cooldown', 'js'),
                            inline: true
                        }, {
                            name: 'Estado',
                            value: (0, config_1.code_text)(`Operación: ${command.data.inactive ? `[🔴] Comando inactivo` : '[🟢] operando con normalidad'}`)
                        }],
                    footer: {
                        text: `ID | ${command.data.id}`
                    },
                    title: `Comando | ${command.data.name}`,
                }],
            components: [{
                    type: discord_js_1.ComponentType.ActionRow,
                    components: [{
                            type: discord_js_1.ComponentType.StringSelect,
                            custom_id: 'menu.002',
                            placeholder: 'Opciones',
                            options: [{
                                    label: 'Parámetros generales',
                                    value: '001',
                                    description: 'Alias, cooldown, estado, entre otros.',
                                    emoji: { name: '📄' }
                                }, {
                                    label: 'Parámetros específicos',
                                    value: '002',
                                    description: 'Opciones y permisos.',
                                    emoji: { name: '📍' }
                                }]
                        }]
                }]
        });
    },
    async message(message, args) {
        let identifier = args[0];
        let commands = await (0, command_handler_1.load_commands)();
        if (!identifier) {
            await menús(message.client, message);
            return;
        }
        let command = commands.get(identifier.toLowerCase()) || commands.find(cmd => cmd.data.alias.includes(identifier.toLowerCase())) || commands.find(cmd => cmd.data.id === identifier.toLowerCase());
        if (!command) {
            await menús(message.client, message);
            return;
        }
        await message.reply({
            embeds: [{
                    author: {
                        name: message.client.user.username,
                        icon_url: message.client.user.avatarURL() || ''
                    },
                    color: command.data.inactive ? discord_js_1.Colors.Red : config_1.theme_color,
                    description: command.data.description,
                    fields: [{
                            name: 'Alias',
                            value: (0, config_1.code_text)(command.data.alias.join(', ') || 'Sin alias')
                        }, {
                            name: 'Categoría',
                            value: (0, config_1.code_text)(menus_json_1.default.find(menu => menu.id === command.data.category)?.name || 'Sin categoría'),
                            inline: true
                        }, {
                            name: 'Filtro nsfw',
                            value: (0, config_1.code_text)(command.data.nsfw ? '- Activo' : '+ Inactivo', 'diff'),
                            inline: true
                        }, {
                            name: 'Cooldown',
                            value: (0, config_1.code_text)(command.data.cooldown ? `${command.data.cooldown} segundos` : 'Sin cooldown', 'js'),
                            inline: true
                        }, {
                            name: 'Estado',
                            value: (0, config_1.code_text)(`Operación: ${command.data.inactive ? `[🔴] Comando inactivo` : '[🟢] operando con normalidad'}`)
                        }],
                    footer: {
                        text: `ID | ${command.data.id}`
                    },
                    title: `Comando | ${command.data.name}`,
                }],
            components: [{
                    type: discord_js_1.ComponentType.ActionRow,
                    components: [{
                            type: discord_js_1.ComponentType.StringSelect,
                            custom_id: 'menu.002',
                            placeholder: 'Opciones',
                            options: [{
                                    label: 'Parámetros generales',
                                    value: '001',
                                    description: 'Alias, cooldown, estado, entre otros.',
                                    emoji: { name: '📄' }
                                }, {
                                    label: 'Parámetros específicos',
                                    value: '002',
                                    description: 'Opciones y permisos.',
                                    emoji: { name: '📍' }
                                }]
                        }]
                }]
        });
    },
};
exports.command = command;
async function menús(client, msg) {
    await msg.reply({
        embeds: [{
                author: {
                    name: client.user?.username || '',
                    icon_url: client.user?.avatarURL() || ''
                },
                color: config_1.theme_color,
                description: 'Selecciona una de las categorías del menu desplegable',
                fields: [{
                        name: '<:staff:1262144147687477310> | Soporte',
                        value: `Si requieres algún tipo de ayuda especial, únete a mi [servidor de soporte](https://discord.gg/E3kzS5cYzN)`
                    }],
                title: `<:007:1012749027508498512> | Menu de ayuda`
            }],
        components: [{
                type: discord_js_1.ComponentType.ActionRow,
                components: [{
                        type: discord_js_1.ComponentType.StringSelect,
                        custom_id: 'menu.001',
                        placeholder: 'Selecciona una categoría',
                        options: menus_json_1.default.map(menu => ({
                            label: menu.name,
                            value: menu.id,
                            description: menu.description,
                            emoji: menu.emoji.match(/\d+(?=>)/g)
                                ? { id: menu.emoji.match(/\d+(?=>)/g)?.shift() }
                                : { name: menu.emoji.replace(/<|:[^:]+:|\d+>/g, '') }
                        }))
                    }]
            }]
    });
}
