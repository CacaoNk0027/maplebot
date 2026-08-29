"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateTokenCache = invalidateTokenCache;
const crypto_1 = __importDefault(require("crypto"));
const token_1 = __importDefault(require("../models/token"));
const VALID_TOKEN_TTL = 5 * 60 * 1000;
const INVALID_TOKEN_TTL = 30 * 1000;
const MAX_CACHED_TOKENS = 1_000;
const tokenCache = new Map();
const tokenRequests = new Map();
async function authToken(req, res, next) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ message: 'No autorizado', code: res.statusCode });
    }
    const rawToken = authorization.startsWith('Bearer ')
        ? authorization.slice('Bearer '.length)
        : authorization;
    const tokenHash = crypto_1.default.createHash('sha256').update(rawToken).digest('hex');
    try {
        const cached = tokenCache.get(tokenHash);
        if (cached && cached.expiresAt > Date.now()) {
            if (!cached.valid) {
                return res.status(403).json({ message: 'No autorizado', code: res.statusCode });
            }
            next();
            return;
        }
        if (cached)
            tokenCache.delete(tokenHash);
        let request = tokenRequests.get(tokenHash);
        if (!request) {
            request = token_1.default.exists({ tokenHash })
                .then(token => Boolean(token))
                .finally(() => tokenRequests.delete(tokenHash));
            tokenRequests.set(tokenHash, request);
        }
        const valid = await request;
        const invalidated = tokenCache.get(tokenHash);
        if (invalidated && !invalidated.valid && invalidated.expiresAt > Date.now()) {
            return res.status(403).json({ message: 'No autorizado', code: res.statusCode });
        }
        if (!valid) {
            cacheToken(tokenHash, false, INVALID_TOKEN_TTL);
            return res.status(403).json({ message: 'No autorizado', code: res.statusCode });
        }
        cacheToken(tokenHash, true, VALID_TOKEN_TTL);
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error de servidor', code: res.statusCode });
    }
}
function cacheToken(tokenHash, valid, ttl) {
    if (tokenCache.size >= MAX_CACHED_TOKENS) {
        const oldest = tokenCache.keys().next().value;
        if (oldest)
            tokenCache.delete(oldest);
    }
    tokenCache.set(tokenHash, { valid, expiresAt: Date.now() + ttl });
}
function invalidateTokenCache(tokenHashes) {
    for (const tokenHash of tokenHashes)
        cacheToken(tokenHash, false, VALID_TOKEN_TTL);
}
exports.default = authToken;
