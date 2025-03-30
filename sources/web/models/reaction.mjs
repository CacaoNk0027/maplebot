import mongoose from "mongoose"

const reactionItem = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    anime: {
        type: String,
        required: true,
        trim: true,
        default: 'Desconocido'
    }
}, {
    _id: true
})

const reactionSchema = new mongoose.Schema({
    angry: [reactionItem],
    blush: [reactionItem],
    bored: [reactionItem],
    confused: [reactionItem],
    cry: [reactionItem],
    dance: [reactionItem],
    laugh: [reactionItem],
    like: [reactionItem],
    pout: [reactionItem],
    scream: [reactionItem],
    smug: [reactionItem],
    think: [reactionItem],
    vomit: [reactionItem],
    wink: [reactionItem]
})

const Reaction = mongoose.model('Reaction', reactionSchema)

export default Reaction