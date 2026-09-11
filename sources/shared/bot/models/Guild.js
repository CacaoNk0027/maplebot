"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const settingsCache = new Map();
const SETTINGS_CACHE_TTL = 60_000;
async function cachedSettings(model, guildId) {
    const cached = settingsCache.get(guildId);
    if (cached && cached.expiresAt > Date.now())
        return cached;
    const guild = await model.findOne({ guildId }).select('prefix language').lean();
    const settings = {
        prefix: guild?.prefix || null,
        language: guild?.language || null,
        expiresAt: Date.now() + SETTINGS_CACHE_TTL
    };
    settingsCache.set(guildId, settings);
    return settings;
}
const guild_schema = new mongoose_1.default.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    prefix: {
        type: String,
        default: ''
    },
    roles: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Rolelist'
    },
    welcome: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Welcome'
    },
    farewell: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Farewell'
    },
    logs: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Logs'
    },
    escalation: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Escalation'
    },
    language: {
        type: String,
        enum: ['es-ES', 'en-US'],
        default: null
    }
}, {
    statics: {
        async findServer(guildId) {
            return this.findOne({ guildId });
        },
        async getPrefix(guildId) {
            return (await cachedSettings(this, guildId)).prefix;
        },
        async getLanguage(guildId) {
            return (await cachedSettings(this, guildId)).language;
        },
        async setLanguage(guildId, language) {
            await this.findOneAndUpdate({ guildId }, { $set: { language } }, { upsert: true, runValidators: true });
            const cached = settingsCache.get(guildId);
            if (cached) {
                settingsCache.set(guildId, {
                    ...cached,
                    language,
                    expiresAt: Date.now() + SETTINGS_CACHE_TTL
                });
            }
            else {
                settingsCache.delete(guildId);
            }
        },
        async setPrefix(guildId, prefix) {
            await this.findOneAndUpdate({ guildId }, { $set: { prefix } }, { upsert: true, runValidators: true });
            const cached = settingsCache.get(guildId);
            if (cached) {
                settingsCache.set(guildId, {
                    ...cached,
                    prefix: prefix || null,
                    expiresAt: Date.now() + SETTINGS_CACHE_TTL
                });
            }
            else {
                settingsCache.delete(guildId);
            }
        }
    }
});
const Guild = mongoose_1.default.model('Guild', guild_schema);
exports.default = Guild;
