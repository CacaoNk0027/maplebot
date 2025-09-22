"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = __importDefault(require("../models/user"));
const token_1 = __importDefault(require("../models/token"));
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    let { password } = req.body;
    let userId = req.session.userId;
    if (!userId) {
        res.status(401).json({
            message: 'No autorizado',
            code: res.statusCode,
            data: {}
        });
        return;
    }
    let user = await user_1.default.findById(userId);
    let match = await user.comparePassword(password);
    if (!match) {
        res.status(400).json({
            message: 'Autorizacion no cedida',
            code: res.statusCode,
            data: {}
        });
        return;
    }
    let token = crypto_1.default.randomBytes(32).toString('base64');
    let newToken = new token_1.default({ userId, token });
    try {
        await token_1.default.deleteMany({ userId });
        await newToken.save();
        res.status(201).json({
            message: "token generado correctamente",
            code: res.statusCode,
            data: {
                token
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error interno del servidor",
            code: res.statusCode,
            data: {}
        });
    }
});
router.post('/reveal', async (req, res) => {
    let { password } = req.body;
    let userId = req.session.userId;
    if (!userId)
        return res.status(401).json({
            message: "No autorizado",
            code: res.statusCode,
            data: {}
        });
    let user = await user_1.default.findById(userId);
    let match = await user.comparePassword(password);
    if (!match)
        return res.status(400).json({
            message: 'Contraseña incorrecta',
            code: res.statusCode,
            data: {}
        });
    try {
        let token = await token_1.default.findOne({ userId });
        res.status(200).json({
            message: "token enviado",
            code: res.statusCode,
            data: {
                token: token?.token
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error interno del servidor",
            code: res.statusCode,
            data: {}
        });
    }
});
exports.default = router;
