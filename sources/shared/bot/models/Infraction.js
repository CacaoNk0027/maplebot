"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const RETENTION_SECONDS = 60 * 60 * 24 * 90;
const sources = ['automod', 'manual'];
const manualActions = ['ban', 'softban', 'kick', 'warn'];
/** Los datos de la regla solo existen cuando la infracción viene de AutoMod. */
function requiredForAutoMod() {
    return this.source === 'automod';
}
const infraction_schema = new mongoose_1.default.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    source: { type: String, enum: sources, default: 'automod' },
    ruleId: { type: String, default: null, required: requiredForAutoMod },
    ruleName: { type: String, default: null, trim: true, maxlength: 100, required: requiredForAutoMod },
    triggerType: { type: Number, default: null, required: requiredForAutoMod },
    actionType: { type: Number, default: null, required: requiredForAutoMod },
    channelId: { type: String, default: null },
    matched: { type: String, default: null, trim: true, maxlength: 200 },
    moderatorId: { type: String, default: null },
    action: { type: String, enum: [...manualActions, null], default: null },
    reason: { type: String, default: null, trim: true, maxlength: 400 },
    createdAt: { type: Date, default: Date.now, expires: RETENTION_SECONDS }
}, {
    statics: {
        async record(entry) {
            return await this.create(entry);
        },
        async listByUser(guildId, userId, limit = 10, skip = 0) {
            return await this.find({ guildId, userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
        },
        async countByUser(guildId, userId, since) {
            const filter = { guildId, userId };
            if (since)
                filter.createdAt = { $gte: since };
            return await this.countDocuments(filter);
        },
        async countByGuild(guildId) {
            return await this.countDocuments({ guildId });
        },
        async topOffenders(guildId, limit = 5) {
            const results = await this.aggregate([
                { $match: { guildId } },
                { $group: { _id: '$userId', total: { $sum: 1 } } },
                { $sort: { total: -1 } },
                { $limit: limit },
                { $project: { _id: 0, userId: '$_id', total: 1 } }
            ]);
            return results;
        },
        async countWarnings(guildId, userId) {
            return await this.countDocuments({ guildId, userId, source: 'manual', action: 'warn' });
        },
        async removeLatestWarning(guildId, userId) {
            return await this.findOneAndDelete({ guildId, userId, source: 'manual', action: 'warn' }, { sort: { createdAt: -1 } });
        }
    }
});
infraction_schema.index({ guildId: 1, userId: 1, createdAt: -1 });
const Infraction = mongoose_1.default.model('Infraction', infraction_schema);
exports.default = Infraction;
