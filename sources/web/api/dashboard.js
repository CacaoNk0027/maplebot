"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = __importDefault(require("../models/token"));
const user_1 = __importDefault(require("../models/user"));
const express_1 = __importDefault(require("express"));
const credentials_1 = require("./credentials");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    if (!req.session.userId)
        return res.redirect('/api/login');
    let user = await user_1.default.findById(req.session.userId);
    if (!user) {
        // La cuenta se eliminó desde otra sesión: esta ya no representa a nadie.
        return req.session.destroy(() => {
            res.clearCookie('maplebot.sid');
            res.redirect('/api/login');
        });
    }
    let token = await token_1.default.findOne({ userId: req.session.userId });
    res.render('api/dashboard.html', {
        currentName: user?.username,
        hasToken: !!token
    });
});
router.post('/chgname', async (req, res) => {
    let { newUsername, password } = req.body;
    let userId = req.session.userId;
    if (!userId)
        return res.status(401).json({
            message: 'No autenticado',
            code: res.statusCode
        });
    if (!(0, credentials_1.isValidUsername)(newUsername))
        return res.status(400).json({
            message: credentials_1.USERNAME_RULE,
            code: res.statusCode
        });
    try {
        let user = await user_1.default.findById(userId);
        if (!user)
            return res.status(404).json({
                message: 'Usuario no encontrado',
                code: res.statusCode
            });
        let match = await user.comparePassword(password);
        if (!match)
            return res.status(400).json({
                message: 'Contraseña incorrecta',
                code: res.statusCode
            });
        if (user.username === newUsername)
            return res.status(400).json({
                message: 'nombre de usuario identico al actual'
            });
        if (await user_1.default.exists({ username: newUsername }))
            return res.status(400).json({
                message: 'Ese nombre de usuario ya está en uso',
                code: res.statusCode
            });
        user.username = newUsername;
        await user.save();
        res.status(200).json({
            message: 'Usuario cambiado correctamente',
            code: res.statusCode
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error de servidor',
            code: res.statusCode
        });
    }
});
router.post('/chgpass', async (req, res) => {
    let { oldPassword, newPassword } = req.body;
    let userId = req.session.userId;
    if (!userId)
        return res.status(401).json({
            message: 'No autenticado',
            code: res.statusCode
        });
    if (!(0, credentials_1.isValidPassword)(newPassword))
        return res.status(400).json({
            message: credentials_1.PASSWORD_RULE,
            code: res.statusCode
        });
    try {
        let user = await user_1.default.findById(userId);
        if (!user)
            return res.status(404).json({
                message: 'Usuario no encontrado',
                code: res.statusCode
            });
        let match = await user.comparePassword(oldPassword);
        if (!match)
            return res.status(400).json({
                message: 'Contraseña incorrecta',
                code: res.statusCode
            });
        if (newPassword === oldPassword)
            return res.status(400).json({
                message: 'contraseña identica a la actual'
            });
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            message: 'Contraseña cambiada',
            code: res.statusCode
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error de servidor',
            code: res.statusCode
        });
    }
});
exports.default = router;
