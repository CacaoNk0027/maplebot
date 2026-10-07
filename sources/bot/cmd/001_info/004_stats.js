"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord = __importStar(require("discord.js"));
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const systeminformation_1 = __importDefault(require("systeminformation"));
const config_1 = require("../../../bot/config/config");
const command_handler_1 = require("../../../bot/config/command_handler");
const emojis_1 = require("../../../shared/config/emojis");
const command = {
    data: new command_data_1.default()
        .setName("stats")
        .setId("004", "001")
        .setAliases('estadisticas', 'metrics', 'metricas', 'sts')
        .setDescription('Muestra estadísticas como uso de ram, uso de cpu, entre otros.')
        .setDescriptionLocalization('en-US', 'Shows statistics such as RAM usage, CPU usage, among others.'),
    async exec(interaction) {
        await response(interaction);
    },
    async message(message, args) {
        await response(message);
    }
};
exports.command = command;
async function response(caller) {
    const locale = await (0, config_1._locale)(caller.guild);
    try {
        let cmds_size = (await (0, command_handler_1.load_commands)()).size;
        let total_guilds = 0, total_members = 0, total_channels = 0;
        let network, cpu, memory, used_memory, ram;
        if (caller.client.shard) {
            let [guilds, members, channels] = await Promise.all([
                caller.client.shard.fetchClientValues('guilds.cache.size'),
                caller.client.shard.broadcastEval(client => client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0)),
                caller.client.shard.fetchClientValues('channels.cache.size')
            ]);
            total_guilds = guilds.reduce((total, count) => total + count, 0);
            total_members = members.reduce((total, count) => total + count, 0);
            total_channels = channels.reduce((total, count) => total + count, 0);
        }
        else {
            total_guilds = caller.client.guilds.cache.size;
            total_members = caller.client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0);
            total_channels = caller.client.channels.cache.size;
        }
        network = (await systeminformation_1.default.networkStats())[0];
        cpu = (await systeminformation_1.default.currentLoad()).currentLoad.toFixed(2);
        memory = (await systeminformation_1.default.mem());
        used_memory = memory.total - memory.available;
        ram = (used_memory / memory.total * 100).toFixed(2);
        let embed = new discord.EmbedBuilder()
            .setAuthor({
            name: caller.client.user?.username,
            iconURL: caller.client.user?.avatarURL() || undefined
        })
            .setColor(config_1.theme_color)
            .setDescription(`${(0, config_1.text)(locale, 'cmd.001.004.description')} ${emojis_1.EMOJI.wink}`)
            .setFields([{
                name: `${(0, config_1.text)(locale, 'cmd.001.004.field1.name')} | ${emojis_1.EMOJI.memberList}`,
                value: (0, config_1.code_text)(`+ ${total_members}`, 'diff'),
                inline: true
            }, {
                name: `${(0, config_1.text)(locale, 'cmd.001.004.field2.name')} | ${emojis_1.EMOJI.channelText}`,
                value: (0, config_1.code_text)(`+ ${total_guilds}`, 'diff'),
                inline: true
            }, {
                name: `${(0, config_1.text)(locale, 'cmd.001.004.field3.name')} | 📺`,
                value: (0, config_1.code_text)(`+ ${total_channels}`, 'diff')
            }, {
                name: `${(0, config_1.text)(locale, 'cmd.001.004.field4.name')} | ❗`,
                value: (0, config_1.code_text)(`+ ${cmds_size}`, 'diff'),
                inline: true
            }, {
                name: `${(0, config_1.text)(locale, 'cmd.001.004.field5.name')} | ${emojis_1.EMOJI.slash}`,
                value: (0, config_1.code_text)(`+ ${(await caller.client.application.commands.fetch()).size}`, 'diff'),
                inline: true
            }, {
                name: `${(0, config_1.text)(locale, 'cmd.001.004.field6.name')} | 🛜`,
                value: (0, config_1.code_text)(`↑ ${(network.tx_bytes / (1024 * 1024)).toFixed(2)} MB - ↓ ${(network.rx_bytes / (1024 * 1024)).toFixed(2)} MB`)
            }, {
                name: `${(0, config_1.text)(locale, 'cmd.001.004.field7.name')} | 🐧`,
                value: (0, config_1.code_text)(`CPU | [${(0, config_1.por_barra)(parseFloat(cpu), 15)}] ${cpu}%\nRAM | [${(0, config_1.por_barra)(parseFloat(ram), 15)}] ${ram}%`)
            }]);
        await caller.reply({
            embeds: [embed]
        });
    }
    catch (error) {
        console.error(error);
        await (0, config_1.send)(caller, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
