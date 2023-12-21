let mongoose = require('mongoose')
const welcomeSchema = new mongoose.Schema({
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
const Welcome = mongoose.model('welcome', welcomeSchema)

module.exports = Welcome;