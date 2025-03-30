import mongoose from "mongoose"

const actionItem = new mongoose.Schema({
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

const actionSchema = new mongoose.Schema({
    cook: [actionItem],
    cuddle: [actionItem],
    cure: [actionItem],
    draw: [actionItem],
    drive: [actionItem],
    eat: [actionItem],
    explosion: [actionItem],
    feed: [actionItem],
    hug: [actionItem],
    kickbut: [actionItem],
    kill: [actionItem],
    kiss: [actionItem],
    lick: [actionItem],
    pat: [actionItem],
    peek: [actionItem],
    playing: [actionItem],
    poke: [actionItem],
    punch: [actionItem],
    run: [actionItem],
    sape: [actionItem],
    shoot: [actionItem],
    sip: [actionItem],
    slap: [actionItem],
    sleep: [actionItem],
    stare: [actionItem],
    tickle: [actionItem],
    travel: [actionItem],
    work: [actionItem]
})

const Action = mongoose.model('Action', actionSchema)

export default Action