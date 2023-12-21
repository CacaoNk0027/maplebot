let mongoose = require('mongoose')
const snipeSchema = new mongoose.Schema({
    guildID: String,
    messages: []
})
const Snipe = mongoose.model('snipe', snipeSchema)

module.exports = Snipe;