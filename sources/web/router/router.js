"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const api_1 = __importDefault(require("../api/api"));
const router = express_1.default.Router();
router.use('/api', api_1.default);
router.get('/', async (req, res) => {
    res.render('index.html');
});
router.get('/kmzkuro', async (req, res) => {
    res.render('kmzkuro.html');
});
exports.default = router;
