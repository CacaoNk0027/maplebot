"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const member_notifications_1 = require("../config/member_notifications");
const event = {
    name: discord_js_1.Events.GuildMemberAdd,
    async exec(member) {
        try {
            await (0, member_notifications_1.sendConfiguredNotification)('welcome', member);
        }
        catch (error) {
            console.error('[GuildMemberAdd:ERR] No se pudo enviar la bienvenida:', error);
        }
    }
};
exports.default = event;
