"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interaction = void 0;
const discord_js_1 = require("discord.js");
const interaction_data_1 = __importDefault(require("../../../bot/structs/interaction_data"));
const command_handler_1 = require("../../../bot/config/command_handler");
const config_1 = require("../../../bot/config/config");
const menus_json_1 = __importDefault(require("../../../shared/bot/assets/json/menus.json"));
const interaction = {
    data: new interaction_data_1.default()
        .setId("menu.002")
        .setUnique(),
    async exec(interaction, message) {
        if (!interaction.isAnySelectMenu())
            return;
        const commands = await (0, command_handler_1.load_commands)();
        let identifier = interaction.values.shift();
        let embed = new discord_js_1.EmbedBuilder(message.embeds.shift()?.data);
        let id = embed.data.footer?.text.match(/\d{3}\.\d{3}/g)?.[0] || '';
        let command = commands.find(cmd => cmd.data.id == id);
        if (!command) {
            await interaction.reply({
                content: 'Ha ocurrido un error interno al editar el menu, comunícate con el desarrollador',
                flags: ['Ephemeral']
            });
            return;
        }
        let options = command.data.options.map(option => `${option?.toJSON().required ? `<${option?.toJSON().name}> ${option?.toJSON().description}\n` : `[${option?.toJSON().name}] ${option?.toJSON().description}\n`}`);
        let permissions = {
            user: command?.data.user_permissions.length > 0 ? command.data.user_permissions.map(permission => permission).join(' ') : 'Sin permisos especiales para usuario',
            bot: command?.data.bot_permissions.length > 0 ? command.data.bot_permissions.map(permission => permission).join(' ') : 'Sin permisos especiales para bot'
        };
        if (identifier == '001') {
            embed.setFields([{
                    name: 'Alias',
                    value: (0, config_1.code_text)(command.data.alias.join(', ') || 'Sin alias')
                }, {
                    name: 'Categoría',
                    value: (0, config_1.code_text)(menus_json_1.default.find(c => c.id == command.data.category).name),
                    inline: true
                }, {
                    name: 'Filtro nsfw',
                    value: (0, config_1.code_text)(command.data.nsfw ? '- Activo' : '+ Inactivo', 'diff'),
                    inline: true
                }, {
                    name: 'Cooldown',
                    value: (0, config_1.code_text)(`${command.data.cooldown} segundos`, 'js'),
                    inline: true
                }, {
                    name: 'Estado',
                    value: (0, config_1.code_text)(`Operación: ${command.data.inactive ? `[🔴] Comando inactivo` : '[🟢] operando con normalidad'}`)
                }]);
        }
        else {
            embed.setFields([{
                    name: 'Opciones',
                    value: (0, config_1.code_text)(options.length > 0 ? options.join('') : 'Sin opciones')
                }, {
                    name: 'Permisos',
                    value: (0, config_1.code_text)(`+ Permisos sobre usuario\n${permissions.user}\n+ Permisos sobre la bot\n${permissions.bot}`, 'diff')
                }]);
        }
        await message.edit({
            embeds: [embed]
        }).then(async () => {
            await interaction.deferUpdate();
        }).catch(async (error) => {
            console.error(error);
            await interaction.reply({
                content: 'Ha ocurrido un error interno al editar el menu, comunícate con el desarrollador',
                flags: ['Ephemeral']
            });
        });
    }
};
exports.interaction = interaction;
