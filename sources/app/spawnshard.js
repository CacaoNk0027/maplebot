// importaciones

require('dotenv').config()
const discord = require('discord.js')

// creacion del gestor de shards

const manager = new discord.ShardingManager('./sources/app/body.js', {
    token: process.env['token'], // token del bot
    totalShards: 'auto'
})

manager.on('shardCreate', (shard) => {
    console.info(`La shard #${shard.id} ha sido creada`)
})

manager.spawn()