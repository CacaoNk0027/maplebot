"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../models/user"));
const credentials_1 = require("./credentials");
const router = express_1.default.Router();
router.get('/', (req, res) => {
    if (req.session.userId)
        return res.redirect('/api/dashboard');
    res.render('api/register.html');
});
router.post('/', async (req, res) => {
    const { username, password } = req.body;
    if (!(0, credentials_1.isValidUsername)(username)) {
        return res.status(400).json({ message: credentials_1.USERNAME_RULE, code: res.statusCode });
    }
    if (!(0, credentials_1.isValidPassword)(password)) {
        return res.status(400).json({ message: credentials_1.PASSWORD_RULE, code: res.statusCode });
    }
    try {
        if (await user_1.default.exists({ username })) {
            return res.status(400).json({ message: 'Usuario ya registrado', code: res.statusCode });
        }
        const user = await new user_1.default({ username, password }).save();
        req.session.regenerate((sessionError) => {
            if (sessionError) {
                console.error(sessionError);
                return res.status(500).json({ message: 'Error de servidor', code: res.statusCode });
            }
            ;
            req.session.userId = user._id;
            return res.status(201).json({ message: 'Usuario registrado correctamente', code: res.statusCode, redirect: '/api/dashboard' });
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error de servidor', code: res.statusCode });
    }
});
exports.default = router;
