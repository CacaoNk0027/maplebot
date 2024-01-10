// importaciones

require('dotenv').config()
const discord = require('discord.js')
const { AutoPoster } = require('topgg-autoposter')
let app = require("express")()

app.use(require('morgan' )('dev'))
app.get("/", (req, res) => res.send("👍"))
app.listen(3000);

// creacion del gestor de shards

const manager = new discord.ShardingManager('./sources/app/body.js', {
    token: process.env['token'], // token del bot
    totalShards: 'auto'
})

const topApi = AutoPoster(process.env['topgg_token'], manager)

topApi.on('posted', (data) => {
    console.info(`stats posteadas correctamente en top.gg\n\n${JSON.stringify(data)}\n\n`);
})

topApi.on('error', console.error);

manager.on('shardCreate', (shard) => {
    console.info(`La shard #${shard.id} ha sido creada`)
})

manager.spawn()