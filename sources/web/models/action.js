"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const action_item = new mongoose_1.default.Schema({
    _id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        auto: true,
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
const actionSchema = new mongoose_1.default.Schema({
    cook: [action_item],
    cuddle: [action_item],
    cure: [action_item],
    draw: [action_item],
    drive: [action_item],
    eat: [action_item],
    explosion: [action_item],
    feed: [action_item],
    hug: [action_item],
    kickbut: [action_item],
    kill: [action_item],
    kiss: [action_item],
    lick: [action_item],
    pat: [action_item],
    peek: [action_item],
    playing: [action_item],
    poke: [action_item],
    punch: [action_item],
    run: [action_item],
    sape: [action_item],
    shoot: [action_item],
    sip: [action_item],
    slap: [action_item],
    sleep: [action_item],
    stare: [action_item],
    tickle: [action_item],
    travel: [action_item],
    work: [action_item]
});
const Action = mongoose_1.default.model('Action', actionSchema);
exports.default = Action;
