import * as discord from 'discord.js'
import { AutoPoster } from 'topgg-autoposter'
import mongoose from 'mongoose'
import web from './web/start.mjs'
import { config } from 'dotenv'

config({ path: 'sources/config/.env' })
web()

const manager = new discord.ShardingManager('./sources/bot/client.mjs', {
    token: process.env.TOKEN,
    totalShards: 'auto'
})

const topGG = AutoPoster(process.env.TOPGG_TOKEN, manager)

mongoose.set('strictQuery', false)
mongoose.connect(process.env.URI)
mongoose.connection.on('open', () => {
    console.info('Conexion exitosa a base de datos')
})

topGG.on('posted', () => {
    console.info('Estadisticas cargadas en https://top.gg/')
})

manager.on('shardCreate', (shard) => {
    console.info(`Shard #${shard.id} iniciada`)
})

manager.spawn()