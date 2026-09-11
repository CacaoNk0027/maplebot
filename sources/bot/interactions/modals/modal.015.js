"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modal = void 0;
const interaction_data_1 = __importDefault(require("../../structs/interaction_data"));
const automod_edit_1 = require("../../structs/automod_edit");
const modal = {
    data: new interaction_data_1.default().setId('modal.015'),
    async exec(interaction) { await (0, automod_edit_1.handleAutoModEditModal)(interaction); }
};
exports.modal = modal;
