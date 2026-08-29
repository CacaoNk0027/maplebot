"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActionCatalog = getActionCatalog;
const express_1 = __importDefault(require("express"));
const authorization_1 = __importDefault(require("../../middlewares/authorization"));
const action_1 = __importDefault(require("../../models/action"));
const reaction_1 = __importDefault(require("../../models/reaction"));
const action_categories_1 = require("../../../shared/config/action_categories");
const router = express_1.default.Router();
const ACTION_CACHE_TTL = 5 * 60 * 1000;
let actionCache = null;
let actionRequest = null;
router.get('/', authorization_1.default, async (_req, res) => {
    res.status(200).json({
        message: 'Acceso a SFW',
        code: res.statusCode,
        data: {
            action: '/api/sfw/action',
            reaction: '/api/sfw/reaction'
        }
    });
});
router.get('/action', authorization_1.default, async (_req, res) => {
    try {
        res.status(200).json({
            message: 'Categoría de acción',
            code: res.statusCode,
            data: await getActionCatalog()
        });
    }
    catch (error) {
        console.error('[SFW:Action:ERR] No se pudo obtener el catálogo:', error);
        res.status(500).json({ message: 'Error de servidor', code: res.statusCode });
    }
});
router.get('/action/:category', authorization_1.default, async (req, res) => {
    try {
        const { category } = req.params;
        const { random } = req.query;
        if (!action_categories_1.ACTION_CATEGORY_SET.has(category)) {
            return res.status(404).json({
                message: 'Recurso no encontrado >> Categoría desconocida',
                code: res.statusCode,
                data: {}
            });
        }
        const catalog = await getActionCatalog();
        const gifs = catalog?.[category];
        if (!Array.isArray(gifs) || gifs.length === 0) {
            return res.status(404).json({
                message: 'Recurso no encontrado >> Categoría sin imágenes',
                code: res.statusCode,
                data: {}
            });
        }
        return res.status(200).json({
            message: `ok >> ${category} gif`,
            code: res.statusCode,
            data: random === 'true'
                ? gifs[Math.floor(Math.random() * gifs.length)]
                : gifs
        });
    }
    catch (error) {
        console.error('[SFW:Action:ERR] No se pudo obtener la categoría:', error);
        return res.status(500).json({ message: 'Error de servidor', code: res.statusCode });
    }
});
router.get('/reaction', authorization_1.default, async (_req, res) => {
    res.status(200).json({
        message: 'Categoría de reacción',
        code: res.statusCode,
        data: await reaction_1.default.findOne({})
    });
});
router.get('/reaction/:category', authorization_1.default, async (req, res) => {
    try {
        const { category } = req.params;
        const { random } = req.query;
        const document = await reaction_1.default.findOne({}, { [category]: 1 });
        if (!document?.[category]) {
            return res.status(404).json({
                message: 'Recurso no encontrado >> Categoría desconocida',
                code: res.statusCode,
                data: {}
            });
        }
        const gifs = document[category];
        return res.status(200).json({
            message: `ok >> ${category} gif`,
            code: res.statusCode,
            data: random === 'true'
                ? gifs[Math.floor(Math.random() * gifs.length)]
                : gifs
        });
    }
    catch (error) {
        console.error('[SFW:Reaction:ERR] No se pudo obtener la categoría:', error);
        return res.status(500).json({ message: 'Error de servidor', code: res.statusCode });
    }
});
async function getActionCatalog() {
    if (actionCache && actionCache.expiresAt > Date.now())
        return actionCache.data;
    if (actionRequest)
        return actionRequest;
    actionRequest = action_1.default.findOne({}).lean().exec();
    try {
        const data = await actionRequest;
        actionCache = { data, expiresAt: Date.now() + ACTION_CACHE_TTL };
        return data;
    }
    finally {
        actionRequest = null;
    }
}
exports.default = router;
