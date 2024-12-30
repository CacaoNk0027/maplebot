import * as discord from 'discord.js'
import web from './web/start.mjs'
import connect from './config/connection.mjs'
import { config } from 'dotenv'
import { AutoPoster } from 'topgg-autoposter'

config({ path: 'sources/config/.env' })

await connect().then(() => {
    console.info('Conexion exitosa a base de datos')
})

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