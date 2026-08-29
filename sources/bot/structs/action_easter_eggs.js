"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KISS_EXPERIENCE_REWARD = exports.KISS_ATTEMPT_TTL = exports.KISS_REQUIRED_ATTEMPTS = exports.RETALIATION_TTL = exports.RETALIATION_THRESHOLD = void 0;
exports.registerRetaliationAttempt = registerRetaliationAttempt;
exports.registerKissAttempt = registerKissAttempt;
exports.completeKissEasterEgg = completeKissEasterEgg;
exports.clearActionEasterEggCache = clearActionEasterEggCache;
const User_1 = __importDefault(require("../../shared/bot/models/User"));
exports.RETALIATION_THRESHOLD = 4;
exports.RETALIATION_TTL = 10 * 60 * 1000;
exports.KISS_REQUIRED_ATTEMPTS = 10;
exports.KISS_ATTEMPT_TTL = 15 * 60 * 1000;
exports.KISS_EXPERIENCE_REWARD = 100;
const MAX_TRACKED_ATTEMPTS = 10_000;
const retaliationAttempts = new Map();
const kissAttempts = new Map();
const completedKisses = new Set();
function registerRetaliationAttempt(userId, action) {
    const key = `${action}:${userId}`;
    const now = Date.now();
    const current = retaliationAttempts.get(key);
    const count = current && current.expiresAt > now ? current.count + 1 : 1;
    if (count >= exports.RETALIATION_THRESHOLD) {
        retaliationAttempts.delete(key);
        return true;
    }
    setBoundedAttempt(retaliationAttempts, key, {
        count,
        expiresAt: now + exports.RETALIATION_TTL
    });
    return false;
}
async function registerKissAttempt(userId) {
    if (completedKisses.has(userId))
        return { status: 'completed' };
    const now = Date.now();
    const current = kissAttempts.get(userId);
    if (!current || current.expiresAt <= now) {
        if (await User_1.default.isKissEasterEggCompleted(userId)) {
            completedKisses.add(userId);
            kissAttempts.delete(userId);
            return { status: 'completed' };
        }
    }
    const count = current && current.expiresAt > now ? current.count + 1 : 1;
    setBoundedAttempt(kissAttempts, userId, {
        count,
        expiresAt: now + exports.KISS_ATTEMPT_TTL
    });
    return { status: 'attempt', count };
}
async function completeKissEasterEgg(userId) {
    const result = await User_1.default.completeKissEasterEgg(userId, exports.KISS_EXPERIENCE_REWARD);
    kissAttempts.delete(userId);
    completedKisses.add(userId);
    return result;
}
function setBoundedAttempt(map, key, value) {
    if (!map.has(key) && map.size >= MAX_TRACKED_ATTEMPTS) {
        const oldest = map.keys().next().value;
        if (oldest)
            map.delete(oldest);
    }
    map.delete(key);
    map.set(key, value);
}
function clearActionEasterEggCache() {
    retaliationAttempts.clear();
    kissAttempts.clear();
    completedKisses.clear();
}
