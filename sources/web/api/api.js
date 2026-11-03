"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const register_1 = __importDefault(require("./register"));
const dashboard_1 = __importDefault(require("./dashboard"));
const logout_1 = __importDefault(require("./logout"));
const token_1 = __importDefault(require("./token"));
const login_1 = __importDefault(require("./login"));
const delete_account_1 = __importDefault(require("./delete_account"));
const action_1 = require("../models/action");
const reaction_1 = require("../models/reaction");
const express_rate_limit_1 = require("express-rate-limit");
const router = express_1.default.Router();
const authenticationLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: 'Demasiados intentos. Intenta de nuevo mas tarde.' }
});
router.use('/dashboard', dashboard_1.default);
router.use('/register', authenticationLimiter, register_1.default);
router.use('/tokens', authenticationLimiter, token_1.default);
router.use('/logout', logout_1.default);
router.use('/login', authenticationLimiter, login_1.default);
router.use('/delacc', authenticationLimiter, delete_account_1.default);
// La documentación lista las categorías desde el schema, igual que la lista blanca del API.
const actions = [...action_1.ACTION_CATEGORIES].sort();
const reactions = [...reaction_1.REACTION_CATEGORIES].sort();
// Cuando la web y el API vivan en máquinas distintas, la URL del API no se puede
// deducir del dominio de la página; NEEKURO_API es la misma variable que usa el bot.
function apiBaseUrl(req) {
    return process.env.NEEKURO_API?.trim().replace(/\/$/, '')
        || `${req.protocol}://${req.get('host')}/api/sfw`;
}
router.get('/', (req, res) => {
    res.render('api/index.html', {
        isLoggedIn: Boolean(req.session.userId),
        baseUrl: apiBaseUrl(req),
        actions,
        reactions
    });
});
exports.default = router;
