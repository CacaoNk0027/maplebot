const mongoose = require('mongoose')
const model = new mongoose.Schema({
    creator: String,
    ids: []
})
const CBU = mongoose.model('CBU', model)

exports.CBU = CBU;