"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../models/user"));
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.render('api/login.html');
});
router.post('/', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await user_1.default.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: 'Usuario o contrasena no validos', code: res.statusCode });
        }
        req.session.regenerate((sessionError) => {
            if (sessionError) {
                console.error(sessionError);
                return res.status(500).json({ message: 'Error de servidor', code: res.statusCode });
            }
            ;
            req.session.userId = user._id;
            return res.status(200).json({ message: 'Inicio de sesion exitoso', code: res.statusCode, redirect: '/api' });
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error de servidor', code: res.statusCode });
    }
});
exports.default = router;
