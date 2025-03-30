import mongoose from 'mongoose'
import ms from 'ms'

async function db_connect(URI) {
    let ping = 0
    try {
        let cluster = await mongoose.connect(URI, {
            socketTimeoutMS: ms('10s'),
            heartbeatFrequencyMS: ms('10s'),
            serverSelectionTimeoutMS: ms('20s') 
        })
            
        ping = await cluster.connection.db.admin().ping()
        console.info('ping a base de datos: Status', ping)
    } catch (error) {
        console.error('⛔ Error crítico [BOT_DATABASE]:', error)
        process.exit(1)
    }
}

export default db_connect