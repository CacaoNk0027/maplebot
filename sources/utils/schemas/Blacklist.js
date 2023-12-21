let mongoose = require('mongoose')
const blackSchema = new mongoose.Schema({
    guildID: String,
    words: []
})
const Blacklist = mongoose.model('blacklist', blackSchema)

module.exports = Blacklist;