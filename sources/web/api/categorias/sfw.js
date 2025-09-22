"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authorization_1 = __importDefault(require("../../middlewares/authorization"));
const express_1 = __importDefault(require("express"));
const action_1 = __importDefault(require("../../models/action"));
const reaction_1 = __importDefault(require("../../models/reaction"));
const router = express_1.default.Router();
router.get('/', authorization_1.default, async (req, res) => {
    res.status(200).json({
        message: "Acceso a SFW",
        code: res.statusCode,
        data: {
            action: '/api/sfw/action',
            reaction: '/api/sfw/reaction'
        }
    });
});
router.get('/action', authorization_1.default, async (req, res) => {
    res.status(200).json({
        message: "Categoria de acción",
        code: res.statusCode,
        data: await action_1.default.findOne({})
    });
});
router.get('/action/:category', authorization_1.default, async (req, res) => {
    try {
        let { category } = req.params;
        let { random } = req.query;
        const docto = await action_1.default.findOne({}, { [category]: 1 });
        if (!docto?.[category]) {
            return res.status(404).json({
                message: `Recurso no encontrado >> Categoria desconocida`,
                code: res.statusCode,
                data: {}
            });
        }
        const gifs = docto[category];
        if (!random || random != 'true') {
            return res.status(200).json({
                message: `ok >> ${category} gif`,
                code: res.statusCode,
                data: gifs
            });
        }
        return res.status(200).json({
            message: `ok >> ${category} gif`,
            code: res.statusCode,
            data: gifs[Math.floor(Math.random() * gifs.length)]
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error de servidor', code: res.statusCode });
    }
});
router.get('/reaction', authorization_1.default, async (req, res) => {
    res.status(200).json({
        message: "Categoria de reacción",
        code: res.statusCode,
        data: await reaction_1.default.findOne({})
    });
});
router.get('/reaction/:category', authorization_1.default, async (req, res) => {
    try {
        let { category } = req.params;
        let { random } = req.query;
        const docto = await reaction_1.default.findOne({}, { [category]: 1 });
        if (!docto?.[category]) {
            return res.status(404).json({
                message: `Recurso no encontrado >> Categoria desconocida`,
                code: res.statusCode,
                data: {}
            });
        }
        const gifs = docto[category];
        if (!random || random != 'true') {
            return res.status(200).json({
                message: `ok >> ${category} gif`,
                code: res.statusCode,
                data: gifs
            });
        }
        return res.status(200).json({
            message: `ok >> ${category} gif`,
            code: res.statusCode,
            data: gifs[Math.floor(Math.random() * gifs.length)]
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error de servidor', code: res.statusCode });
    }
});
exports.default = router;
