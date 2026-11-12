"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const api_1 = __importDefault(require("../api/api"));
const package_json_1 = __importDefault(require("../../../package.json"));
const comandos_1 = require("./comandos");
const router = express_1.default.Router();
router.use('/api', api_1.default);
router.get('/', async (req, res) => {
    res.render('index.html', { version: package_json_1.default.version, commandTotal: (0, comandos_1.commandTotal)() });
});
router.get(['/terms', '/terms-of-use'], async (req, res) => {
    res.render('terms.html');
});
router.get(['/privacy', '/privacy-policy'], async (req, res) => {
    res.render('privacy.html');
});
router.get(['/comandos', '/comandos/'], (0, comandos_1.renderCommands)('es'));
router.get(['/commands', '/commands/'], (0, comandos_1.renderCommands)('en'));
router.get('/kmzkuro', async (req, res) => {
    res.render('kmzkuro.html');
});
exports.default = router;
