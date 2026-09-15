"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../models/user"));
const token_1 = __importDefault(require("../models/token"));
const authorization_1 = require("../middlewares/authorization");
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    const { password } = req.body;
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ message: 'No autenticado', code: res.statusCode });
    }
    if (typeof password !== 'string' || !password) {
        return res.status(400).json({ message: 'Debes ingresar tu contraseña', code: res.statusCode });
    }
    try {
        const user = await user_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado', code: res.statusCode });
        }
        if (!(await user.comparePassword(password))) {
            return res.status(400).json({ message: 'Contraseña incorrecta', code: res.statusCode });
        }
        // El token va primero: si luego fallara el borrado del usuario, no debe
        // quedar un token vivo. La caché de autorización lo seguiría aceptando
        // hasta 5 minutos, así que además se invalida en el acto.
        const token = await token_1.default.findOneAndDelete({ userId }).lean();
        if (token?.tokenHash)
            (0, authorization_1.invalidateTokenCache)([token.tokenHash]);
        await user_1.default.deleteOne({ _id: userId });
        req.session.destroy((sessionError) => {
            // La cuenta ya no existe; una sesión que no se pudo destruir queda
            // sin dueño y la dashboard la cierra en el siguiente acceso.
            if (sessionError)
                console.error(sessionError);
            res.clearCookie('maplebot.sid');
            return res.status(200).json({ message: 'Cuenta eliminada correctamente', code: res.statusCode });
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error de servidor', code: res.statusCode });
    }
});
exports.default = router;
