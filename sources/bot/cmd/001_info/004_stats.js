"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const discord_js_1 = require("discord.js");
const systeminformation_1 = __importDefault(require("systeminformation"));
const config_1 = require("../../../bot/config/config");
const command_handler_1 = require("../../../bot/config/command_handler");
const command = {
    data: new command_data_1.default()
        .setName("stats")
        .setId("004", "001")
        .setAliases('estadisticas', 'metrics', 'metricas', 'sts')
        .setDescription('Muestra estadísticas como uso de ram, uso de cpu, entre otros.')
        .setDescriptionLocalization('en-US', 'Shows statistics such as RAM usage, CPU usage, among others.'),
    async exec(interaction) {
        await use(interaction);
    },
    async message(message, args) {
        await use(message, args);
    }
};
exports.command = command;
async function use(interaction, args) {
    const commands = await (0, command_handler_1.load_commands)();
    let msg = await interaction.reply({
        embeds: [{
                description: (0, config_1.reply)('info', 'Cargando estadísticas...'),
                color: discord_js_1.Colors.Yellow
            }]
    });
    let totalGuilds = 0;
    let totalMembers = 0;
    let network, cpu, memory, usedMemory, ram;
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
        network = (await systeminformation_1.default.networkStats())[0];
        cpu = (await systeminformation_1.default.currentLoad()).currentLoad.toFixed(2);
        memory = (await systeminformation_1.default.mem());
        usedMemory = memory.total - memory.available;
        ram = (usedMemory / memory.total * 100).toFixed(2);
    }
    catch (error) {
        console.error(error);
        msg.edit({
            embeds: [{
                    description: (0, config_1.reply)('error', 'ha sucedido un error al tratar de conseguir las estadísticas'),
                    color: discord_js_1.Colors.Red
                }]
        });
        return;
    }
    let embed = new discord_js_1.EmbedBuilder()
        .setAuthor({
        name: interaction.client.user?.username,
        iconURL: interaction.client.user?.avatarURL() || ''
    })
        .setColor(config_1.theme_color)
        .setDescription('Estadísticas cargadas <:007:1012749027508498512>')
        .setFields([{
            name: 'Usuarios | <:newmember:1262144151844028537>',
            value: (0, config_1.code_text)(`+ ${totalMembers}`, 'diff'),
            inline: true
        }, {
            name: 'Servidores | <:partner:1262143727669874761>',
            value: (0, config_1.code_text)(`+ ${totalGuilds}`, 'diff'),
            inline: true
        }, {
            name: 'Canales | 📺',
            value: (0, config_1.code_text)(`+ ${interaction.client.channels.cache.size}`, 'diff')
        }, {
            name: 'Comandos | ❗',
            value: (0, config_1.code_text)(`+ ${commands.size}`, 'diff'),
            inline: true
        }, {
            name: 'Interacciones | <:supportCommands:1262143719033929820>',
            value: (0, config_1.code_text)(`+ ${(await (await interaction.client.application?.fetch()).commands.fetch()).size}`, 'diff'),
            inline: true
        }, {
            name: 'Uso de red | 🛜',
            value: (0, config_1.code_text)(`↑ ${(network.tx_bytes / (1024 * 1024)).toFixed(2)} MB - ↓ ${(network.rx_bytes / (1024 * 1024)).toFixed(2)} MB`)
        }, {
            name: 'Sistema | <:005:1012749024220155964>',
            value: (0, config_1.code_text)(`CPU | [${(0, config_1.por_barra)(parseFloat(cpu), 15)}] ${cpu}%\nRAM | [${(0, config_1.por_barra)(parseFloat(ram), 15)}] ${ram}%`)
        }]);
    await msg.edit({
        embeds: [embed]
    });
}
