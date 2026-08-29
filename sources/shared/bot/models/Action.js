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
    mode: {
        type: String,
        enum: ['pair', 'received'],
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
action_schema.index({ name: 1, mode: 1, pair: 1 }, { unique: true, partialFilterExpression: { mode: 'pair' } });
action_schema.index({ name: 1, mode: 1, author: 1 }, { unique: true, partialFilterExpression: { mode: 'received' } });
const USER_ID_CACHE_TTL = 10 * 60 * 1000;
const MAX_CACHED_USER_IDS = 10_000;
const userIdCache = new Map();
const userIdRequests = new Map();
action_schema.statics.setForUser = async function (name, authorId, receptorId) {
    if (!name || !authorId || !receptorId) {
        throw new TypeError('La acción, el autor y el receptor son obligatorios');
    }
    const [author, receptor] = await Promise.all([
        resolveUserObjectId(authorId),
        resolveUserObjectId(receptorId)
    ]);
    const a = String(author);
    const b = String(receptor);
    const pair = a < b ? `${a}:${b}` : `${b}:${a}`;
    const filter = { name, mode: 'pair', pair };
    const setOnInsert = { name, mode: 'pair', pair, author, receptor };
    const updated = await this.findOneAndUpdate(filter, { $inc: { quantity: 1 }, $setOnInsert: setOnInsert }, { new: true, upsert: true }).exec();
    return updated;
};
action_schema.statics.setTotalPerAction_ToUser = async function (name, userId) {
    if (!name || !userId)
        throw new TypeError('La acción y el usuario son obligatorios');
    const userObjectId = await resolveUserObjectId(userId);
    const filter = { name, mode: 'received', author: userObjectId };
    const setOnInsert = { name, mode: 'received', author: userObjectId };
    const updated = await this.findOneAndUpdate(filter, { $inc: { quantity: 1 }, $setOnInsert: setOnInsert }, { new: true, upsert: true }).exec();
    return updated;
};
async function resolveUserObjectId(userId) {
    const cached = userIdCache.get(userId);
    if (cached && cached.expiresAt > Date.now())
        return cached.id;
    if (cached)
        userIdCache.delete(userId);
    let request = userIdRequests.get(userId);
    if (!request) {
        const createdRequest = User_1.default.getUser(userId)
            .then((user) => user._id)
            .finally(() => userIdRequests.delete(userId));
        userIdRequests.set(userId, createdRequest);
        request = createdRequest;
    }
    const id = await request;
    if (userIdCache.size >= MAX_CACHED_USER_IDS) {
        const oldest = userIdCache.keys().next().value;
        if (oldest)
            userIdCache.delete(oldest);
    }
    userIdCache.set(userId, { id, expiresAt: Date.now() + USER_ID_CACHE_TTL });
    return id;
}
const Action = mongoose_1.default.model('Action', action_schema);
exports.default = Action;
