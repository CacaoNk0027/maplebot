"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modal = void 0;
const interaction_data_1 = __importDefault(require("../../structs/interaction_data"));
const member_notifications_1 = require("../../config/member_notifications");
const modal = { data: new interaction_data_1.default().setId('modal.001'), async exec(interaction) { await (0, member_notifications_1.handleNotificationModal)(interaction, 'welcome', 'type'); } };
exports.modal = modal;
