let mongoose = require('mongoose')
const muteSchema = new mongoose.Schema({
    guildID: String,
    role: String
})
const Mute = mongoose.model('mute', muteSchema)

module.exports = Mute;