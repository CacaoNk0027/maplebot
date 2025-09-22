"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: 'Error al cerrar sesión',
                code: res.statusCode
            });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Cierre de sesión exitoso' });
    });
});
exports.default = router;
