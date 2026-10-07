"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const member_notifications_1 = require("../config/member_notifications");
const member_log_1 = require("../structs/member_log");
const event = {
    name: discord_js_1.Events.GuildMemberRemove,
    async exec(member) {
        try {
            if (!member.partial)
                await (0, member_notifications_1.sendConfiguredNotification)('farewell', member);
        }
        catch (error) {
            console.error('[GuildMemberRemove:ERR] No se pudo enviar la despedida:', error);
        }
        try {
            await (0, member_log_1.logMemberLeave)(member);
        }
        catch (error) {
            console.error('[GuildMemberRemove:ERR] No se pudo registrar la salida:', error);
        }
    }
};
exports.default = event;
