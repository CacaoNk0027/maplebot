"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interaction = void 0;
const interaction_data_1 = __importDefault(require("../../structs/interaction_data"));
const member_notifications_1 = require("../../config/member_notifications");
const interaction = {
    data: new interaction_data_1.default().setId('menu.004').setUnique(),
    async exec(interaction) {
        if (!interaction.isStringSelectMenu())
            return;
        await (0, member_notifications_1.showNotificationModal)(interaction, 'welcome');
    }
};
exports.interaction = interaction;
