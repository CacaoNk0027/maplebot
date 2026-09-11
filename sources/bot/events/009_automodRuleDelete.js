"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const automod_log_1 = require("../structs/automod_log");
const event = {
    name: discord_js_1.Events.AutoModerationRuleDelete,
    async exec(rule) {
        try {
            await (0, automod_log_1.logAutoModRuleChange)('deleted', rule);
        }
        catch (error) {
            console.error('[AutoModerationRuleDelete:ERR] No se pudo registrar la eliminación:', error);
        }
    }
};
exports.default = event;
