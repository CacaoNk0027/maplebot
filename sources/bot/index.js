"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const env_1 = require("../shared/config/env");
// Entrada del bot. Arranca sola (`pnpm run start:bot`) o lanzada por el
// supervisor de `src/index.ts`. No depende de la web: los GIFs salen del API
// al que apunta NEEKURO_API, esté donde esté.
(0, env_1.loadEnvironment)('bot', ['BOT_TOKEN', 'URI_DBBOT', 'NEEKURO']);
const manager = new discord_js_1.ShardingManager('sources/bot/client/bot.js', {
    token: process.env['BOT_TOKEN'],
    totalShards: 'auto'
});
manager.on('shardCreate', (shard) => {
    console.log(`Shard #${shard.id} iniciada`);
});
// Las shards son procesos aparte: si este sale sin cerrarlas, quedan huérfanas
// y conectadas a Discord con el mismo token.
(0, env_1.onShutdown)(() => {
    console.info('[bot] Cerrando shards');
    for (const shard of manager.shards.values())
        shard.kill();
    process.exit(0);
});
manager.spawn().catch((error) => {
    console.error('[bot] No se pudieron lanzar las shards:', error);
    for (const shard of manager.shards.values())
        shard.kill();
    process.exit(1);
});
