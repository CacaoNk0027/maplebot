"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Guild_1 = __importDefault(require("./Guild"));
const logs_schema = new mongoose_1.default.Schema({
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
        async updateAutoMod(guildId, changes) {
            const logs = await this.ensureForGuild(guildId);
            const current = logs.automod ?? {};
            logs.automod = {
                channel: 'channel' in changes ? changes.channel : current.channel ?? null,
                executions: changes.executions ?? current.executions ?? true,
                rules: changes.rules ?? current.rules ?? true
            };
            await logs.save();
            return logs;
        },
        async setAutoModChannel(guildId, channelId) {
            return await this.updateAutoMod(guildId, { channel: channelId });
        },
        async disableAutoMod(guildId) {
            return await this.updateAutoMod(guildId, { channel: null });
        }
    }
});
const Logs = mongoose_1.default.model('Logs', logs_schema);
exports.default = Logs;
