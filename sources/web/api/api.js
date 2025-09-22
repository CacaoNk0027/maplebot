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
const sfw_1 = __importDefault(require("./categorias/sfw"));
const router = express_1.default.Router();
router.use('/dashboard', dashboard_1.default);
router.use('/register', register_1.default);
router.use('/tokens', token_1.default);
router.use('/logout', logout_1.default);
router.use('/login', login_1.default);
router.use('/sfw', sfw_1.default);
router.get('/', (req, res) => {
    let isLoggedIn = req.session.userId ? true : false;
    res.render('api/index.html', { isLoggedIn });
});
exports.default = router;
