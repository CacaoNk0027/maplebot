import mongoose from "mongoose";

const channelsSchema = new mongoose.Schema({
    guildId: {
        type: String,
        unique: true,
        required: true
    },
    confessId: String,
    farewellId: String,
    suggestId: String,
    welcomeId: String
})

/**
 * 
 * @param {'confessId'|'farewellId'|'suggestId'|'welcomeId'} field 
 * @param {string} ID 
 * @returns {boolean}
 */
channelsSchema.methods.compareId = (field, ID) => {
    return this[field] == ID
}

export default mongoose.model('channels', channelsSchema)