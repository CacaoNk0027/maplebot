let mongoose = require('mongoose')
const channelsSchema = new mongoose.Schema({
    guildID: String,
    suggest: String,
    confession: String,
    welcome: String,
    farewell: String
})
const SetChannels = mongoose.model('channels', channelsSchema)

module.exports = SetChannels;