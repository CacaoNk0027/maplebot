let mongoose = require('mongoose')
const prefixSchema = new mongoose.Schema({
    guildID: String,
    prefix: String
})
const SetPrefix = mongoose.model('prefix', prefixSchema)

module.exports = SetPrefix;