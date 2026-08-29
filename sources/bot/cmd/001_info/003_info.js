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
const moment_1 = __importDefault(require("moment"));
const discord = __importStar(require("discord.js"));
const command_data_1 = __importDefault(require("../../structs/command_data"));
const command_handler_1 = require("../../config/command_handler");
const config_1 = require("../../config/config");
const Guild_1 = __importDefault(require("../../../shared/bot/models/Guild"));
const packageJson = require('../../../../package.json');
const command = {
    data: new command_data_1.default()
        .setName('info')
        .setAliases('botinfo', 'maplebot', 'infobot', 'bot', 'informacion', 'maple')
        .setId('003', '001')
        .setDescription('Aprende más sobre mí y mis estadísticas')
        .setDescriptionLocalization('en-US', 'Learn more about me and my statistics'),
    async exec(interaction) {
        await response(interaction);
    },
    async message(message, args) {
        await response(message);
    }
};
exports.command = command;
async function response(caller) {
    const locale = caller.guildId ? await Guild_1.default.getLanguage(caller.guildId) ?? caller.guild?.preferredLocale : undefined;
    try {
        let collection = await (0, command_handler_1.load_commands)();
        let total_cmds = collection.size;
        let active_cmds = 0;
        let inactive_cmds = 0;
        for (const command of collection.values()) {
            if (command.data.inactive) {
                inactive_cmds++;
            }
            else {
                active_cmds++;
            }
        }
        let total_guilds = 0;
        let total_members = 0;
        if (caller.client.shard) {
            const [guilds, members] = await Promise.all([
                caller.client.shard.fetchClientValues('guilds.cache.size'),
                caller.client.shard.broadcastEval(client => client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0))
            ]);
            total_guilds = guilds.reduce((total, count) => total + count, 0);
            total_members = members.reduce((total, count) => total + count, 0);
        }
        else {
            total_guilds = caller.client.guilds.cache.size;
            total_members = caller.client.guilds.cache.reduce((accum, guild) => accum + guild.memberCount, 0);
        }
        const embed = new discord.EmbedBuilder()
            .setTitle(`${(0, config_1.text)(locale, 'cmd.001.003.title')} :heart:`)
            .setURL('https://discord.gg/E3kzS5cYzN')
            .setAuthor({
            name: caller.client.user?.username || 'Maple Bot',
            iconURL: caller.client.user?.avatarURL() || undefined
        })
            .setColor(config_1.theme_color)
            .setDescription((0, config_1.text)(locale, 'cmd.001.003.description'))
            .addFields([{
                name: `${(0, config_1.text)(locale, 'cmd.001.003.field1.name')} 🔎`,
                value: (0, config_1.text)(locale, 'cmd.001.003.field1.value', Math.floor(caller.client.user?.createdTimestamp / 1000), caller.client.user?.id, packageJson.version)
            }, {
                name: `${(0, config_1.text)(locale, 'cmd.001.003.field2.name')} 📊`,
                value: (0, config_1.text)(locale, 'cmd.001.003.field2.value', total_guilds, total_members, total_cmds, active_cmds, inactive_cmds, moment_1.default.duration(caller.client.uptime).locale(locale?.toLowerCase().startsWith('en') ? 'en' : 'es').humanize()),
                inline: true
            }, {
                name: `${(0, config_1.text)(locale, 'cmd.001.003.field3.name')} 📍`,
                value: (0, config_1.text)(locale, 'cmd.001.003.field3.value', discord.version, process.version, caller.client.shard ? caller.client.shard.ids[0] + 1 : 'sn/info', caller.client.shard ? caller.client.shard.count : 'sn/info'),
                inline: true
            }]);
        await caller.reply({
            embeds: [embed]
        });
    }
    catch (error) {
        console.error(error);
        await (0, config_1.send)(caller, 'error', (0, config_1.text)(locale, 'reply.error'), true);
        return;
    }
}
