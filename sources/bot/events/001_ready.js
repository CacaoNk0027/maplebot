"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const ready = {
    name: discord_js_1.Events.ClientReady,
    once: true,
    async exec(client) {
        try {
            console.info('[Session] => Iniciando como:', client.user?.username);
        }
        catch (error) {
            console.error('Error en evento ready:', error);
        }
    }
};
exports.default = ready;
