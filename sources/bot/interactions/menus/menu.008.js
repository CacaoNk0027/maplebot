"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interaction = void 0;
const interaction_data_1 = __importDefault(require("../../structs/interaction_data"));
const embed_builder_1 = require("../../structs/embed_builder");
const interaction = {
    data: new interaction_data_1.default().setId('menu.008').setUnique(),
    async exec(target) {
        if (!target.isChannelSelectMenu())
            return;
        await (0, embed_builder_1.handleChannelSelect)(target);
    }
};
exports.interaction = interaction;
