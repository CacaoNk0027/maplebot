"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const member_notifications_1 = require("../config/member_notifications");
const member_log_1 = require("../structs/member_log");
const event = {
    name: discord_js_1.Events.GuildMemberAdd,
    async exec(member) {
        // La bienvenida y el registro son independientes: si una falla, la otra
        // debe seguir funcionando.
        try {
            await (0, member_notifications_1.sendConfiguredNotification)('welcome', member);
        }
        catch (error) {
            console.error('[GuildMemberAdd:ERR] No se pudo enviar la bienvenida:', error);
        }
        try {
            await (0, member_log_1.logMemberJoin)(member);
        }
        catch (error) {
            console.error('[GuildMemberAdd:ERR] No se pudo registrar la entrada:', error);
        }
    }
};
exports.default = event;
