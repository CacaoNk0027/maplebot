"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const start_1 = __importDefault(require("web/start"));
dotenv_1.default.config();
(0, start_1.default)();
const manager = new discord_js_1.ShardingManager('sources/bot/client/bot.js', {
    token: process.env['BOT_TOKEN'],
    totalShards: 'auto'
});
manager.on('shardCreate', (shard) => {
    console.log(`Shard #${shard.id} iniciada`);
});
manager.spawn();
