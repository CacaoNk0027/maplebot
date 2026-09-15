"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReactionCatalog = exports.getActionCatalog = void 0;
const express_1 = __importDefault(require("express"));
const authorization_1 = __importDefault(require("../../middlewares/authorization"));
const action_1 = __importStar(require("../../models/action"));
const reaction_1 = __importStar(require("../../models/reaction"));
const router = express_1.default.Router();
const CATALOG_CACHE_TTL = 5 * 60 * 1000;
/**
 * Lee el documento único de una colección de GIFs y lo cachea. Las peticiones
 * concurrentes comparten la misma consulta.
 */
function createCatalogReader(model) {
    let cache = null;
    let request = null;
    return async () => {
        if (cache && cache.expiresAt > Date.now())
            return cache.data;
        if (request)
            return request;
        request = model.findOne({}).lean().exec();
        try {
            const data = await request;
            cache = { data, expiresAt: Date.now() + CATALOG_CACHE_TTL };
            return data;
        }
        finally {
            request = null;
        }
    };
}
exports.getActionCatalog = createCatalogReader(action_1.default);
exports.getReactionCatalog = createCatalogReader(reaction_1.default);
// Acciones y reacciones comparten el mismo contrato: lista blanca tomada del
// schema, catálogo en caché y 404 distinto para categoría desconocida o vacía.
const routes = [
    {
        path: 'action',
        title: 'Categoría de acción',
        logTag: 'SFW:Action',
        categories: action_1.ACTION_CATEGORIES,
        readCatalog: exports.getActionCatalog
    },
    {
        path: 'reaction',
        title: 'Categoría de reacción',
        logTag: 'SFW:Reaction',
        categories: reaction_1.REACTION_CATEGORIES,
        readCatalog: exports.getReactionCatalog
    }
];
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
for (const route of routes) {
    router.get(`/${route.path}`, authorization_1.default, async (_req, res) => {
        try {
            res.status(200).json({
                message: route.title,
                code: res.statusCode,
                data: await route.readCatalog()
            });
        }
        catch (error) {
            console.error(`[${route.logTag}:ERR] No se pudo obtener el catálogo:`, error);
            res.status(500).json({ message: 'Error de servidor', code: res.statusCode });
        }
    });
    router.get(`/${route.path}/:category`, authorization_1.default, async (req, res) => {
        try {
            const { category } = req.params;
            const { random } = req.query;
            if (!route.categories.has(category)) {
                return res.status(404).json({
                    message: 'Recurso no encontrado >> Categoría desconocida',
                    code: res.statusCode,
                    data: {}
                });
            }
            const catalog = await route.readCatalog();
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
            console.error(`[${route.logTag}:ERR] No se pudo obtener la categoría:`, error);
            return res.status(500).json({ message: 'Error de servidor', code: res.statusCode });
        }
    });
}
exports.default = router;
