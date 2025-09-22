"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: 'config/.env' });
const manager = new discord_js_1.ShardingManager('dist/bot/client/bot.js', {
    token: process.env['bot_token'],
    totalShards: 'auto'
});
manager.on('shardCreate', (shard) => {
    console.log(`Shard #${shard.id} iniciada`);
});
manager.spawn();
