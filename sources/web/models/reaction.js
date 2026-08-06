"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const reactionItem = new mongoose_1.default.Schema({
    _id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
});
const reactionSchema = new mongoose_1.default.Schema({
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
});
const Reaction = mongoose_1.default.model('Reaction', reactionSchema);
exports.default = Reaction;
