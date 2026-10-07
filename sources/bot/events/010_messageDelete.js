"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const message_log_1 = require("../structs/message_log");
const event = {
    name: discord_js_1.Events.MessageDelete,
    async exec(message) {
        try {
            await (0, message_log_1.logMessageDelete)(message);
        }
        catch (error) {
            console.error('[MessageDelete:ERR] No se pudo registrar el borrado:', error);
        }
    }
};
exports.default = event;
