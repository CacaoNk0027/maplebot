import mongoose from 'mongoose'

const prefixSchema = new mongoose.Schema({
    guildId: {
        type: String,
        unique: true,
        required: true
    },
    prefix: {
        type: String,
        required: true
    }
})

prefixSchema.methods.comparePrefix = function(prefix) {
    return this.prefix == prefix
}

const Prefix = mongoose.model('Prefixes', prefixSchema)
export default Prefix