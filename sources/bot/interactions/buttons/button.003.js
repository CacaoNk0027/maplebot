"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.button = void 0;
const interaction_data_1 = __importDefault(require("../../structs/interaction_data"));
const log_panel_1 = require("../../structs/log_panel");
const button = {
    data: new interaction_data_1.default().setId('button.003').setUnique(),
    async exec(interaction) {
        await (0, log_panel_1.handleToggleButton)(interaction);
    }
};
exports.button = button;
