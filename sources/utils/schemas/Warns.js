let mongoose = require('mongoose')
const warnSchema = new mongoose.Schema({
    guildID: String,
    warns: []
})
const Warns = mongoose.model('guildWarn', warnSchema)

module.exports = Warns;