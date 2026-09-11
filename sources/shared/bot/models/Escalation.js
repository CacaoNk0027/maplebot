"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_TIMEOUT_MINUTES = exports.defaultSteps = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Guild_1 = __importDefault(require("./Guild"));
/** Discord no admite aislamientos de más de 28 días. */
const MAX_TIMEOUT_MINUTES = 40_320;
exports.MAX_TIMEOUT_MINUTES = MAX_TIMEOUT_MINUTES;
const actions = ['warn', 'timeout'];
const defaultSteps = [
    { threshold: 3, action: 'warn', minutes: null },
    { threshold: 5, action: 'timeout', minutes: 10 },
    { threshold: 8, action: 'timeout', minutes: 60 },
    { threshold: 12, action: 'timeout', minutes: 1440 }
];
exports.defaultSteps = defaultSteps;
const step_schema = new mongoose_1.default.Schema({
    threshold: { type: Number, required: true, min: 1, max: 1000 },
    action: { type: String, required: true, enum: actions },
    minutes: { type: Number, default: null, min: 1, max: MAX_TIMEOUT_MINUTES }
}, { _id: false });
const escalation_schema = new mongoose_1.default.Schema({
    enabled: { type: Boolean, default: false },
    windowDays: { type: Number, default: 7, min: 1, max: 90 },
    steps: { type: [step_schema], default: () => [...defaultSteps] }
}, {
    statics: {
        async getByGuildId(guildId) {
            const guild = await Guild_1.default.findOne({ guildId });
            if (!guild?.escalation)
                return null;
            return await this.findById(guild.escalation);
        },
        async ensureForGuild(guildId) {
            if (!guildId)
                throw new Error('Se requiere un servidor para configurar el escalado.');
            const session = await mongoose_1.default.startSession();
            try {
                let result;
                await session.withTransaction(async () => {
                    const guild = await Guild_1.default.findOneAndUpdate({ guildId }, { $setOnInsert: { guildId } }, { new: true, upsert: true, session });
                    if (guild.escalation) {
                        const existing = await this.findById(guild.escalation).session(session);
                        if (existing) {
                            result = existing;
                            return;
                        }
                    }
                    const escalation = new this();
                    await escalation.save({ session });
                    guild.escalation = escalation.id;
                    await guild.save({ session });
                    result = escalation;
                });
                if (!result)
                    throw new Error('No se pudo preparar la configuración de escalado.');
                return result;
            }
            finally {
                await session.endSession();
            }
        },
        async setEnabled(guildId, enabled) {
            const escalation = await this.ensureForGuild(guildId);
            escalation.enabled = enabled;
            await escalation.save();
            return escalation;
        },
        async setWindow(guildId, windowDays) {
            const escalation = await this.ensureForGuild(guildId);
            escalation.windowDays = windowDays;
            await escalation.save();
            return escalation;
        },
        async setStep(guildId, step) {
            if (step.action === 'timeout' && !step.minutes) {
                throw new Error('Un escalón de aislamiento requiere una duración en minutos.');
            }
            const escalation = await this.ensureForGuild(guildId);
            const existing = escalation.steps.find(current => current.threshold === step.threshold);
            if (existing) {
                existing.action = step.action;
                existing.minutes = step.action === 'timeout' ? step.minutes : null;
            }
            else {
                escalation.steps.push({
                    threshold: step.threshold,
                    action: step.action,
                    minutes: step.action === 'timeout' ? step.minutes : null
                });
            }
            escalation.steps.sort((left, right) => left.threshold - right.threshold);
            await escalation.save();
            return escalation;
        },
        async removeStep(guildId, threshold) {
            const escalation = await this.ensureForGuild(guildId);
            const index = escalation.steps.findIndex(step => step.threshold === threshold);
            if (index >= 0)
                escalation.steps.splice(index, 1);
            await escalation.save();
            return escalation;
        },
        async resetSteps(guildId) {
            const escalation = await this.ensureForGuild(guildId);
            escalation.steps.splice(0, escalation.steps.length);
            for (const step of defaultSteps)
                escalation.steps.push({ ...step });
            await escalation.save();
            return escalation;
        }
    }
});
const Escalation = mongoose_1.default.model('Escalation', escalation_schema);
exports.default = Escalation;
