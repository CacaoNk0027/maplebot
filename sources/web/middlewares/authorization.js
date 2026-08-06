"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const token_1 = __importDefault(require("../models/token"));
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
        const token = await token_1.default.exists({ tokenHash });
        if (!token) {
            return res.status(403).json({ message: 'No autorizado', code: res.statusCode });
        }
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error de servidor', code: res.statusCode });
    }
}
exports.default = authToken;
