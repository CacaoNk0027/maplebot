"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interaction = void 0;
const interaction_data_1 = __importDefault(require("../../structs/interaction_data"));
const log_panel_1 = require("../../structs/log_panel");
const interaction = {
    data: new interaction_data_1.default().setId('menu.011').setUnique(),
    async exec(target) {
        if (!target.isChannelSelectMenu())
            return;
        await (0, log_panel_1.handleLogChannelSelect)(target);
    }
};
exports.interaction = interaction;
