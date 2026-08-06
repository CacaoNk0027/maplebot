"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_handler_1 = require("../handlers/command_handler");
let afiliated_servers = [
    '1146357424782049282'
];
const event = {
    name: discord_js_1.Events.InteractionCreate,
    exec: async (interaction) => {
        try {
            if (!interaction.isChatInputCommand())
                return;
            if (!afiliated_servers.includes(interaction.guildId)) {
                await interaction.deferReply({ withResponse: false });
                return;
            }
            ;
            let commands = await (0, command_handler_1.load_private_commands)();
            let command = commands.get(interaction.commandName) || commands.find(cmd => cmd.data.id == interaction.commandName || cmd.data.alias.includes(interaction.commandName));
            if (!command) {
                await interaction.reply({
                    content: '> Comando desconocido!? Intenta ver el menu help, si crees que se trata de un error comunicate con el desarrollador',
                    flags: ['Ephemeral']
                });
                return;
            }
            await command.exec(interaction);
        }
        catch (error) {
            console.error('[InteractionCreate:ERR]! Ha ocurrido un error inesperado', error);
        }
    }
};
exports.default = event;
