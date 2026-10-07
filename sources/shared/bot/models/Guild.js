"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const settingsCache = new Map();
const SETTINGS_CACHE_TTL = 60_000;
/**
 * Una sola consulta por servidor cada minuto para todo lo que se lee en
 * caliente. `lastSeenVersion` y `updateNotices` viajan en la misma proyección
 * a propósito: se consultan en cada comando y así no suman consultas.
 */
async function cachedSettings(model, guildId) {
    const cached = settingsCache.get(guildId);
    if (cached && cached.expiresAt > Date.now())
        return cached;
    const guild = await model.findOne({ guildId })
        .select('prefix language lastSeenVersion updateNotices')
        .lean();
    const settings = {
        prefix: guild?.prefix || null,
        language: guild?.language || null,
        lastSeenVersion: guild?.lastSeenVersion || null,
        updateNotices: guild?.updateNotices ?? true,
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
    },
    // Ultima version que este servidor ya vio anunciada. `null` significa que
    // nunca se le anuncio nada, no que este desactualizado.
    lastSeenVersion: {
        type: String,
        default: null
    },
    updateNotices: {
        type: Boolean,
        default: true
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
        async getUpdateState(guildId) {
            const { lastSeenVersion, updateNotices } = await cachedSettings(this, guildId);
            return { lastSeenVersion, updateNotices };
        },
        /**
         * Deja constancia de que el servidor ya vio esta version.
         *
         * Refresca la cache en el acto en vez de invalidarla: dos comandos a la
         * vez en el mismo servidor caen en el mismo shard, asi que el segundo ya
         * lee la version nueva y no se duplica el aviso.
         */
        async markVersionSeen(guildId, version) {
            await this.findOneAndUpdate({ guildId }, { $set: { lastSeenVersion: version } }, { upsert: true, runValidators: true });
            const cached = settingsCache.get(guildId);
            if (cached) {
                settingsCache.set(guildId, { ...cached, lastSeenVersion: version });
            }
            else {
                settingsCache.delete(guildId);
            }
        },
        async setUpdateNotices(guildId, enabled) {
            await this.findOneAndUpdate({ guildId }, { $set: { updateNotices: enabled } }, { upsert: true, runValidators: true });
            const cached = settingsCache.get(guildId);
            if (cached) {
                settingsCache.set(guildId, { ...cached, updateNotices: enabled });
            }
            else {
                settingsCache.delete(guildId);
            }
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
