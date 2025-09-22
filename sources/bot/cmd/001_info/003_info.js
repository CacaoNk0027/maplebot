"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const moment_1 = __importDefault(require("moment"));
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const command_handler_1 = require("../../config/command_handler");
const config_1 = require("../../config/config");
const packageJson = require('../../../../package.json');
const command = {
    data: new command_data_1.default()
        .setName('info')
        .setAliases('botinfo', 'maplebot', 'infobot', 'bot', 'informacion')
        .setId('003', '001')
        .setDescription('Aprende más sobre mí y mis estadísticas')
        .setDescriptionLocalization('en-US', 'Learn more about me and my statistics'),
    async exec(interaction) {
        let commands = await (0, command_handler_1.load_commands)();
        let totalGuilds = 0;
        let totalMembers = 0;
        try {
            if (interaction.client.shard) {
                let [guilds, members] = await Promise.all([
                    interaction.client.shard.fetchClientValues('guilds.cache.size'),
                    interaction.client.shard.broadcastEval((c) => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0))
                ]);
                totalGuilds = guilds.reduce((acc, guildCount) => acc + guildCount, 0);
                totalMembers = members.reduce((acc, memberCount) => acc + memberCount, 0);
            }
            else {
                totalGuilds = interaction.client.guilds.cache.size;
                totalMembers = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            }
            await interaction.reply({
                embeds: [{
                        title: 'Información :heart:',
                        url: 'https://discord.gg/E3kzS5cYzN',
                        author: {
                            name: interaction.client.user?.username || 'Maple Bot',
                            icon_url: interaction.client.user?.avatarURL() || ''
                        },
                        color: config_1.theme_color,
                        description: `Hola! Soy **${interaction.client.user?.username || 'Maple Bot'}**, trabajo siendo una bot multiusos. Soy buena en lo que me gusta, **moderación y roleplay** aun asi, trato de mejorar, aunque aveces me cuestione ciertas cosas...`,
                        fields: [{
                                name: 'Sobre mi 🔎',
                                value: `Creador | kmz_kuro\nCreación | <t:${Math.floor(Date.now() / 1000)}:F>\nID | ${interaction.client.user?.id || 'sn/info'}\nVersión | ${packageJson.version || 'sn/info'}`
                            }, {
                                name: 'Estadísticas 📊',
                                value: `Servidores | ${totalGuilds}\nUsuarios | ${totalMembers}\nComandos | **${commands.size}** totales (**${commands.filter(c => c.data.inactive == false).size}** activos, **${commands.filter(c => c.data.inactive == true).size}** inactivos)\nTiempo de actividad | \`${moment_1.default.duration(interaction.client.uptime).humanize()}\``,
                                inline: true
                            }, {
                                name: 'Datos específicos 🔍',
                                value: `Librería | Discord.js ^${discord_js_1.version}\nLenguaje | TypeScript\nNode.js | ^${process.version}\nShard | ${interaction.client.shard ? interaction.client.shard.ids[0] + 1 : 'sn/info'}/${interaction.client.shard ? interaction.client.shard.count : 'sn/info'}`,
                                inline: true
                            }]
                    }]
            });
        }
        catch (error) {
            console.error('[CommandInfoBot:ERR]! ha ocurrido un error en el apartado interaction', error);
            await interaction.reply({
                content: 'Ha ocurrido un error al obtener la información del bot. Por favor, contacta con el desarrollador',
                flags: ['Ephemeral']
            });
        }
    },
    async message(message, args) {
        let commands = await (0, command_handler_1.load_commands)();
        let totalGuilds = 0;
        let totalMembers = 0;
        try {
            if (message.client.shard) {
                let [guilds, members] = await Promise.all([
                    message.client.shard.fetchClientValues('guilds.cache.size'),
                    message.client.shard.broadcastEval((c) => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0))
                ]);
                totalGuilds = guilds.reduce((acc, guildCount) => acc + guildCount, 0);
                totalMembers = members.reduce((acc, memberCount) => acc + memberCount, 0);
            }
            else {
                totalGuilds = message.client.guilds.cache.size;
                totalMembers = message.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            }
            await message.reply({
                embeds: [{
                        title: 'Información :heart:',
                        url: 'https://discord.gg/E3kzS5cYzN',
                        author: {
                            name: message.client.user?.username || 'Maple Bot',
                            icon_url: message.client.user?.avatarURL() || ''
                        },
                        color: config_1.theme_color,
                        description: `Hola! Soy **${message.client.user?.username || 'Maple Bot'}**, trabajo siendo una bot multiusos. Soy buena en lo que me gusta, **moderación y roleplay** aun asi, trato de mejorar, aunque aveces me cuestione ciertas cosas...`,
                        fields: [{
                                name: 'Sobre mi 🔎',
                                value: `Creador | kmz_kuro\nCreación | <t:${Math.floor(Date.now() / 1000)}:F>\nID | ${message.client.user?.id || 'sn/info'}\nVersión | ${packageJson.version || 'sn/info'}`
                            }, {
                                name: 'Estadísticas 📊',
                                value: `Servidores | ${totalGuilds}\nUsuarios | ${totalMembers}\nComandos | **${commands.size}** totales (**${commands.filter(c => c.data.inactive == false).size}** activos, **${commands.filter(c => c.data.inactive == true).size}** inactivos)\nTiempo de actividad | **${moment_1.default.duration(message.client.uptime).format('d [días], h [horas], m [minutos], s [segundos]')}**`,
                                inline: true
                            }, {
                                name: 'Datos específicos 🔍',
                                value: `Librería | Discord.js ^${discord_js_1.version}\nLenguaje | TypeScript\nNode.js | ^${process.version}\nShard | ${message.client.shard ? message.client.shard.ids[0] + 1 : 'sn/info'}/${message.client.shard ? message.client.shard.count : 'sn/info'}`,
                                inline: true
                            }]
                    }]
            });
        }
        catch (error) {
            console.error('[CommandInfoBot:ERR]! ha ocurrido un error en el apartado interaction', error);
            await message.reply({
                content: 'Ha ocurrido un error al obtener la información del bot. Por favor, contacta con el desarrollador'
            });
        }
    }
};
exports.command = command;
