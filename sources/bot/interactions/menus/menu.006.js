"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interaction = void 0;
const interaction_data_1 = __importDefault(require("../../structs/interaction_data"));
const automod_edit_1 = require("../../structs/automod_edit");
const interaction = {
    data: new interaction_data_1.default().setId('menu.006').setUnique(),
    async exec(menu) { await (0, automod_edit_1.handleAutoModEditMenu)(menu); }
};
exports.interaction = interaction;
