"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.button = void 0;
const interaction_data_1 = __importDefault(require("../../structs/interaction_data"));
const embed_builder_1 = require("../../structs/embed_builder");
const button = {
    data: new interaction_data_1.default().setId('button.001').setUnique(),
    async exec(interaction) {
        await (0, embed_builder_1.handleSendButton)(interaction);
    }
};
exports.button = button;
