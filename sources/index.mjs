import * as discord from 'discord.js'
import web from './web/start.mjs'
import { config } from 'dotenv'
import { AutoPoster } from 'topgg-autoposter'
import db_connect from './config/database.mjs'

config({ path: 'sources/config/.env' })

await db_connect(process.env.URI_DBNEEKURO)

web()

const manager = new discord.ShardingManager('./sources/bot/client.mjs', {
    token: process.env.TOKEN,
    totalShards: 'auto'
})

const topGG = AutoPoster(process.env.TOPGG_TOKEN, manager)

topGG.on('posted', () => {
    console.info('Estadisticas cargadas en https://top.gg/')
})

manager.on('shardCreate', (shard) => {
    console.info(`Shard #${shard.id} iniciada`)
})

manager.spawn()