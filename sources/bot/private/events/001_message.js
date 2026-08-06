"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Guild_1 = __importDefault(require("../../../shared/bot/models/Guild"));
const command_handler_1 = require("../handlers/command_handler");
let afiliated_servers = [
    '1146357424782049282'
];
const event = {
    name: discord_js_1.Events.MessageCreate,
    exec: async (message) => {
        let commands = await (0, command_handler_1.load_private_commands)();
        if (message.author.bot)
            return;
        if (message.channel.type != discord_js_1.ChannelType.GuildText)
            return;
        if (!afiliated_servers.includes(message.guild.id))
            return;
        let prefix = await Guild_1.default.getPrefix(message.guild.id) || 'm!';
        if (!message.content.toLowerCase().startsWith(prefix))
            return;
        let args = message.content.slice(prefix.length).trim().split(/ +/g);
        let identifier = args.shift()?.toLowerCase();
        let command = commands.get(identifier) || commands.find(cmd => cmd.data.id == identifier || cmd.data.alias.includes(identifier));
        if (!command)
            return;
        await command.message(message, args);
    }
};
exports.default = event;
