"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../models/user"));
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.render('api/register.html');
});
router.post('/', async (req, res) => {
    let { username, password } = req.body;
    const usernameRegex = /^[A-Za-z0-9_-]{1,30}$/;
    if (!usernameRegex.test(username))
        return res.status(400).json({
            message: 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos, y debe tener un máximo de 30 caracteres.',
            code: res.statusCode
        });
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(password))
        return res.status(400).json({
            message: 'La contraseña debe tener al menos 8 caracteres, contener letras, números y caracteres especiales.',
            code: res.statusCode
        });
    try {
        let user = await user_1.default.findOne({ username });
        if (user)
            return res.status(400).json({
                message: "Usuario ya registrado",
                code: res.statusCode
            });
        user = new user_1.default({ username, password });
        await user.save();
        req.session.userId = user._id;
        res.status(201).json({
            message: 'Usuario registrado correctamente',
            code: res.statusCode,
            redirect: '/api'
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
