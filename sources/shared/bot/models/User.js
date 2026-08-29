"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_schema = new mongoose_1.default.Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    level: {
        type: Number,
        default: 1,
        min: 1
    },
    exp: {
        current: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        max: {
            type: Number,
            required: true,
            default: 100,
            min: 100
        }
    },
    easterEggs: {
        kissCompleted: {
            type: Boolean,
            required: true,
            default: false
        },
        kissCompletedAt: {
            type: Date,
            required: false,
            default: null
        }
    }
});
user_schema.statics.getUser = async function (id) {
    if (!id)
        throw new TypeError('El ID de usuario es obligatorio');
    return await this.findOneAndUpdate({ id }, { $setOnInsert: { id } }, { new: true, upsert: true, setDefaultsOnInsert: true }).exec();
};
user_schema.statics.updateLevel = async function (userId) {
    const gainedExperience = randomExperience(20, 2);
    if (gainedExperience <= 0)
        return null;
    try {
        const user = await this.findOneAndUpdate({ id: userId }, {
            $setOnInsert: { id: userId, level: 1, 'exp.max': 100 },
            $inc: { 'exp.current': gainedExperience }
        }, { new: true, upsert: true, setDefaultsOnInsert: true }).exec();
        return await normalizeExperience(this, user);
    }
    catch (error) {
        console.error(`[UserLevel:${userId}:ERR] No se pudo actualizar la experiencia:`, error);
        return null;
    }
};
user_schema.statics.isKissEasterEggCompleted = async function (userId) {
    if (!userId)
        throw new TypeError('El ID de usuario es obligatorio');
    const user = await this.getUser(userId);
    return user.easterEggs?.kissCompleted === true;
};
user_schema.statics.completeKissEasterEgg = async function (userId, rewardExperience) {
    if (!userId)
        throw new TypeError('El ID de usuario es obligatorio');
    if (!Number.isInteger(rewardExperience) || rewardExperience < 0) {
        throw new TypeError('La recompensa de experiencia debe ser un entero positivo');
    }
    await this.getUser(userId);
    const user = await this.findOneAndUpdate({ id: userId, 'easterEggs.kissCompleted': { $ne: true } }, {
        $set: {
            'easterEggs.kissCompleted': true,
            'easterEggs.kissCompletedAt': new Date()
        },
        $inc: { 'exp.current': rewardExperience }
    }, { new: true }).exec();
    if (!user) {
        const existing = await this.getUser(userId);
        return {
            awarded: false,
            level: existing.level,
            currentExperience: existing.exp.current,
            maximumExperience: existing.exp.max
        };
    }
    const normalized = await normalizeExperience(this, user);
    return {
        awarded: true,
        level: normalized.level,
        currentExperience: normalized.exp.current,
        maximumExperience: normalized.exp.max
    };
};
user_schema.methods.getLevelInfo = function () {
    return {
        level: this.level,
        current_exp: this.exp.current,
        max_exp: this.exp.max
    };
};
async function normalizeExperience(model, user) {
    let level = user.level;
    let currentExperience = user.exp.current;
    let maximumExperience = user.exp.max;
    while (currentExperience >= maximumExperience) {
        currentExperience -= maximumExperience;
        level += 1;
        maximumExperience = nextLevelExperience(level);
    }
    if (level === user.level
        && currentExperience === user.exp.current
        && maximumExperience === user.exp.max) {
        return user;
    }
    const normalized = await model.findByIdAndUpdate(user._id, {
        $set: {
            level,
            'exp.current': currentExperience,
            'exp.max': maximumExperience
        }
    }, { new: true }).exec();
    return normalized;
}
function nextLevelExperience(level) {
    let sum = 0;
    for (let currentLevel = 5; currentLevel <= level; currentLevel++) {
        sum += currentLevel / 4 * Math.pow(2, 6);
    }
    return 100 + sum;
}
function randomExperience(rank, divisor) {
    const result = Math.floor(Math.random() * rank);
    return result % divisor === 0 ? result : 0;
}
const User = mongoose_1.default.model('User', user_schema);
exports.default = User;
