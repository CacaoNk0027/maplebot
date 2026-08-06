"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const express_1 = require("express");
const user_1 = __importDefault(require("../models/user"));
const token_1 = __importDefault(require("../models/token"));
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    const { password } = req.body;
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ message: 'No autorizado', code: res.statusCode, data: {} });
    }
    try {
        const user = await user_1.default.findById(userId);
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: 'Autorizacion no concedida', code: res.statusCode, data: {} });
        }
        const token = crypto_1.default.randomBytes(32).toString('base64url');
        const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        await token_1.default.deleteMany({ userId });
        await new token_1.default({ userId, tokenHash }).save();
        return res.status(201).json({
            message: 'Token generado correctamente. Guardalo ahora: no podra volver a mostrarse.',
            code: res.statusCode,
            data: { token }
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor', code: res.statusCode, data: {} });
    }
});
router.post('/reveal', (_req, res) => {
    return res.status(410).json({
        message: 'Por seguridad los tokens no se pueden revelar. Genera uno nuevo si lo perdiste.',
        code: res.statusCode,
        data: {}
    });
});
exports.default = router;
