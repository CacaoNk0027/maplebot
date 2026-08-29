"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const api_1 = __importDefault(require("../api/api"));
const package_json_1 = __importDefault(require("../../../package.json"));
const router = express_1.default.Router();
router.use('/api', api_1.default);
router.get('/', async (req, res) => {
    res.render('index.html', { version: package_json_1.default.version });
});
router.get(['/terms', '/terms-of-use'], async (req, res) => {
    res.render('terms.html');
});
router.get(['/privacy', '/privacy-policy'], async (req, res) => {
    res.render('privacy.html');
});
router.get('/kmzkuro', async (req, res) => {
    res.render('kmzkuro.html');
});
exports.default = router;
