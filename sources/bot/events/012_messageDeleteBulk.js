"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const message_log_1 = require("../structs/message_log");
const event = {
    name: discord_js_1.Events.MessageBulkDelete,
    async exec(messages, channel) {
        try {
            await (0, message_log_1.logMessagePurge)(messages, channel);
        }
        catch (error) {
            console.error('[MessageBulkDelete:ERR] No se pudo registrar la purga:', error);
        }
    }
};
exports.default = event;
