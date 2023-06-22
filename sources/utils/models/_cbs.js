const mongoose = require('mongoose')
const model = new mongoose.Schema({
    creator: String,
    ids: []
})
const CBS = mongoose.model('CBS', model)

exports.CBS = CBS;