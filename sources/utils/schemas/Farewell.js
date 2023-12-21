let mongoose = require('mongoose')
const farSchema = new mongoose.Schema({
    guildID: String,
    message: String,
    type: String, 
    background: {
        tipo: String,
        data: String
    },
    color: {
        title: String,
        description: String,
        avatar: String
    },
    description: String,
    title: String
})
const Farewell = mongoose.model('farewell', farSchema)

module.exports = Farewell;