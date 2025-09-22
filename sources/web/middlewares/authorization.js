"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = __importDefault(require("../models/token"));
async function auth_token(req, res, next) {
    let auth = req.headers['authorization'];
    if (!auth) {
        res.status(401).json({ message: 'No autorizado', code: res.statusCode });
        return 1;
    }
    try {
        let query = await token_1.default.findOne({ token: auth });
        if (!query) {
            res.status(403).json({ message: 'No autorizado', code: res.statusCode });
            return 1;
        }
        next();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error de servidor', code: res.statusCode });
        return 1;
    }
}
exports.default = auth_token;
