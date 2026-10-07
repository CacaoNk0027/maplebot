"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Guild_1 = __importDefault(require("./Guild"));
const log_events_1 = require("../../config/log_events");
/**
 * Traduce la clave del catálogo a la clave de almacenamiento.
 *
 * Mongoose no admite puntos en las claves de un `Map`, y las del catálogo los
 * usan para separar categoría y evento (`message.delete`). Se guardan con `_`
 * y se traducen aquí, el único archivo que toca el mapa: el catálogo, el panel
 * y las claves de traducción siguen usando el punto.
 */
function storageKey(key) {
    return key.replace(/\./g, '_');
}
const event_settings = new mongoose_1.default.Schema({
    enabled: { type: Boolean, default: true },
    channel: { type: String, default: null }
}, { _id: false });
const logs_schema = new mongoose_1.default.Schema({
    channel: { type: String, default: null },
    // Un mapa en vez de un campo por evento: agregar tipos nuevos al catálogo no
    // obliga a migrar el esquema.
    events: { type: Map, of: event_settings, default: () => new Map() },
    // Se conserva solo para migrar a quien ya tenía registros de AutoMod.
    automod: {
        channel: { type: String, default: null },
        executions: { type: Boolean, default: true },
        rules: { type: Boolean, default: true }
    }
}, {
    statics: {
        async getByGuildId(guildId) {
            const guild = await Guild_1.default.findOne({ guildId });
            if (!guild?.logs)
                return null;
            return await this.findById(guild.logs);
        },
        async ensureForGuild(guildId) {
            if (!guildId)
                throw new Error('Se requiere un servidor para configurar los registros.');
            const session = await mongoose_1.default.startSession();
            try {
                let result;
                await session.withTransaction(async () => {
                    const guild = await Guild_1.default.findOneAndUpdate({ guildId }, { $setOnInsert: { guildId } }, { new: true, upsert: true, session });
                    if (guild.logs) {
                        const existingLogs = await this.findById(guild.logs).session(session);
                        if (existingLogs) {
                            result = existingLogs;
                            return;
                        }
                    }
                    const logs = new this();
                    await logs.save({ session });
                    guild.logs = logs.id;
                    await guild.save({ session });
                    result = logs;
                });
                if (!result)
                    throw new Error('No se pudo preparar la configuración de registros.');
                return result;
            }
            finally {
                await session.endSession();
            }
        },
        async getSettings(guildId) {
            const logs = await this.getByGuildId(guildId);
            if (!logs)
                return null;
            const migrated = await migrateLegacy(logs);
            return normalize(migrated);
        },
        async setDefaultChannel(guildId, channelId) {
            const logs = await migrateLegacy(await this.ensureForGuild(guildId));
            logs.channel = channelId;
            // Al estrenar canal se encienden los eventos marcados por defecto;
            // sin esto el servidor configuraría el canal y no vería nada.
            if (channelId && !logs.events?.size) {
                const events = logs.events ?? new Map();
                for (const key of log_events_1.LOG_EVENT_KEYS) {
                    events.set(storageKey(key), { enabled: log_events_1.LOG_EVENTS[key].enabledByDefault, channel: null });
                }
                logs.events = events;
            }
            await logs.save();
            return normalize(logs);
        },
        async setEvent(guildId, key, changes) {
            const logs = await migrateLegacy(await this.ensureForGuild(guildId));
            const events = logs.events ?? new Map();
            const current = events.get(storageKey(key)) ?? {
                enabled: log_events_1.LOG_EVENTS[key].enabledByDefault,
                channel: null
            };
            events.set(storageKey(key), {
                enabled: changes.enabled ?? current.enabled,
                channel: 'channel' in changes ? changes.channel ?? null : current.channel ?? null
            });
            logs.events = events;
            await logs.save();
            return normalize(logs);
        }
    }
});
/**
 * Traslada la configuración vieja de AutoMod al catálogo nuevo la primera vez
 * que se consulta, para que nadie pierda lo que ya tenía puesto.
 */
async function migrateLegacy(logs) {
    const legacy = logs.automod;
    if (!legacy?.channel || logs.events?.size)
        return logs;
    const events = logs.events ?? new Map();
    for (const key of log_events_1.LOG_EVENT_KEYS) {
        const enabled = key === 'automod.executions' ? legacy.executions ?? true
            : key === 'automod.rules' ? legacy.rules ?? true
                : log_events_1.LOG_EVENTS[key].enabledByDefault;
        events.set(storageKey(key), { enabled, channel: null });
    }
    logs.events = events;
    logs.channel = logs.channel ?? legacy.channel;
    logs.automod = { channel: null, executions: true, rules: true };
    await logs.save();
    return logs;
}
function normalize(logs) {
    const events = {};
    for (const key of log_events_1.LOG_EVENT_KEYS) {
        const stored = logs.events?.get(storageKey(key));
        events[key] = {
            enabled: stored?.enabled ?? log_events_1.LOG_EVENTS[key].enabledByDefault,
            channel: stored?.channel ?? null
        };
    }
    return { defaultChannel: logs.channel ?? null, events };
}
const Logs = mongoose_1.default.model('Logs', logs_schema);
exports.default = Logs;
