"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("./User"));
const action_schema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    author: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receptor: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'User',
        required: false,
        default: null
    },
    pair: {
        type: String,
        required: false
    },
    quantity: {
        type: Number,
        required: false,
        default: 0
    }
});
action_schema.index({ name: 1, pair: 1 }, { unique: true, partialFilterExpression: { pair: { $exists: true } } });
action_schema.statics.setForUser = async function (name, authorId, receptorId) {
    const Model = this;
    authorId = (await User_1.default.getUser(authorId))._id;
    receptorId = (await User_1.default.getUser(receptorId))._id;
    const rec = receptorId === undefined ? null : receptorId;
    let pair;
    if (rec === null) {
        pair = `${authorId}:null`;
    }
    else {
        const a = String(authorId);
        const b = String(rec);
        pair = a < b ? `${a}:${b}` : `${b}:${a}`;
    }
    const filter = { name, pair };
    const setOnInsert = { name, pair, author: authorId, receptor: rec };
    const updated = await Model.findOneAndUpdate(filter, { $inc: { quantity: 1 }, $setOnInsert: setOnInsert }, { new: true, upsert: true }).exec();
    return updated;
};
action_schema.statics.setTotalPerAction_ToUser = async function (name, userId) {
    const Model = this;
    userId = (await User_1.default.getUser(userId))._id;
    const filter = { name, author: userId };
    const setOnInsert = { name, author: userId };
    const updated = await Model.findOneAndUpdate(filter, { $inc: { quantity: 1 }, $setOnInsert: setOnInsert }, { new: true, upsert: true }).exec();
    return updated;
};
const Action = mongoose_1.default.model('Action', action_schema);
exports.default = Action;
