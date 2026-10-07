"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const message_log_1 = require("../structs/message_log");
const event = {
    name: discord_js_1.Events.MessageUpdate,
    async exec(before, after) {
        try {
            await (0, message_log_1.logMessageUpdate)(before, after);
        }
        catch (error) {
            console.error('[MessageUpdate:ERR] No se pudo registrar la edición:', error);
        }
    }
};
exports.default = event;
