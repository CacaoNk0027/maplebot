import mongoose from "mongoose"

const channelsSchema = new mongoose.Schema({
    guildId: {
        type: String,
        unique: true,
        required: true
    },
    confessId: {
        type: String,
        default: null
    },
    farewellId: {
        type: String,
        default: null
    },
    suggestId: {
        type: String,
        default: null
    },
    welcomeId: {
        type: String,
        default: null
    }
})

channelsSchema.methods.compareId = function(field, ID) {
    return this[field] === ID
}

const Channels = mongoose.model('Channels', channelsSchema)
export default Channels