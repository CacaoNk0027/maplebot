"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interaction = void 0;
const interaction_data_1 = __importDefault(require("../../../bot/structs/interaction_data"));
const menus_json_1 = __importDefault(require("../../../shared/bot/assets/json/menus.json"));
const discord_js_1 = require("discord.js");
const config_1 = require("../../../bot/config/config");
const command_handler_1 = require("../../../bot/config/command_handler");
const Guild_1 = __importDefault(require("../../../shared/bot/models/Guild"));
const interaction = {
    data: new interaction_data_1.default()
        .setId("menu.001")
        .setUnique(),
    async exec(interaction, message) {
        if (!interaction.isAnySelectMenu())
            return;
        let identifier = interaction.values.shift();
        let category = menus_json_1.default.find(menu => menu.id === identifier);
        let embed = new discord_js_1.EmbedBuilder(message.embeds.shift()?.data);
        let commands = await (0, command_handler_1.load_commands)();
        let prefix = await Guild_1.default.getPrefix(message.guild.id) || 'm!';
        embed.setTitle(`${category?.emoji} | ${category?.name}`)
            .setDescription(category?.description || 'sin descripción establecida')
            .setFields({
            name: 'Comandos',
            value: (0, config_1.commands_menu)(prefix, commands, category?.id || '')
        });
        await message.edit({
            embeds: [embed]
        }).then(async () => {
            await interaction.deferUpdate();
        }).catch(async (err) => {
            console.error(err);
            await interaction.reply({
                content: 'Ha ocurrido un error interno al editar el menu, comunicate con el desarrollador',
                flags: ['Ephemeral']
            });
        });
    }
};
exports.interaction = interaction;
