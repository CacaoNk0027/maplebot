"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../models/user"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.render('api/login.html');
});
router.post('/', async (req, res) => {
    let { username, password } = req.body;
    try {
        let user = await user_1.default.findOne({ username });
        if (!user)
            return res.status(400).json({
                message: "Usuario o contraseña no validos",
                code: res.statusCode
            });
        let match = (await user).comparePassword(password);
        if (!match)
            return res.status(400).json({
                message: "Usuario o contraseña no validos",
                code: res.statusCode
            });
        req.session.userId = user._id;
        res.status(200).json({
            message: 'inicio de sesión exitoso',
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
