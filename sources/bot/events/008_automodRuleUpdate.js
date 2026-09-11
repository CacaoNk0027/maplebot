"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const automod_log_1 = require("../structs/automod_log");
const event = {
    name: discord_js_1.Events.AutoModerationRuleUpdate,
    async exec(previous, current) {
        try {
            await (0, automod_log_1.logAutoModRuleChange)('updated', current, previous);
        }
        catch (error) {
            console.error('[AutoModerationRuleUpdate:ERR] No se pudo registrar la actualización:', error);
        }
    }
};
exports.default = event;
