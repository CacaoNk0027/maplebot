"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncInfractionRetention = syncInfractionRetention;
const mongoose_1 = __importDefault(require("mongoose"));
// Discord no permite conservar contenido de mensajes más de 30 días, y `matched`
// puede llevar un fragmento del mensaje.
const RETENTION_SECONDS = 60 * 60 * 24 * 30;
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
/**
 * Ajusta el plazo del índice TTL que ya existe en la base.
 *
 * Mongo no modifica un índice al cambiar el esquema: Mongoose intenta crearlo
 * con el valor nuevo, choca con el viejo y lo deja como estaba. Sin esto, bajar
 * `RETENTION_SECONDS` no surtiría efecto en una base ya desplegada.
 *
 * Se borra y se vuelve a crear en vez de usar `collMod` porque el usuario de la
 * base solo tiene permisos de lectura y escritura, y `collMod` exige `dbAdmin`.
 */
async function syncInfractionRetention() {
    try {
        const collection = Infraction.collection;
        const indexes = await collection.indexes();
        const ttl = indexes.find(index => typeof index.expireAfterSeconds === 'number');
        if (!ttl?.name || ttl.expireAfterSeconds === RETENTION_SECONDS)
            return;
        // Varios shards arrancan a la vez: otro puede haberlo borrado ya.
        await collection.dropIndex(ttl.name).catch((error) => {
            if (error.code !== 27)
                throw error;
        });
        await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: RETENTION_SECONDS });
        console.info(`[Infraction] Retención ajustada a ${RETENTION_SECONDS / 86400} días`);
    }
    catch (error) {
        // 26: la colección aún no existe, así que Mongoose creará el índice ya
        // con el plazo correcto.
        if (error.code === 26)
            return;
        console.error('[Infraction:ERR] No se pudo ajustar la retención:', error);
    }
}
exports.default = Infraction;
