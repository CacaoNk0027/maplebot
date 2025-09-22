"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const event_handler_1 = require("../config/event_handler");
const set_commands_1 = require("../../bot/config/set_commands");
class MapleBot {
    client;
    constructor() {
        this.client = new discord_js_1.Client({
            intents: 33283,
            allowedMentions: {
                repliedUser: false
            }
        });
    }
    async start() {
        try {
            await this.handlers();
            await this.client.login(process.env['BOT_TOKEN']);
            await (0, set_commands_1.set_commands)(this.client.application?.id || this.client.user?.id || process.env['bot_id']);
            this.client.user?.setPresence({
                activities: [{
                        name: 'Hola! soy Maple',
                        type: discord_js_1.ActivityType.Playing
                    }],
                status: 'idle'
            });
            console.info('>>> El cliente inicio correctamente');
        }
        catch (error) {
            console.error('[ERR]! Error al iniciar bot:', error);
        }
    }
    async handlers() {
        try {
            await (0, event_handler_1.events)(this.client);
            console.info('>>> Handlers cargados correctamente');
        }
        catch (error) {
            console.error('[ERR]! Error al iniciar handlers:', error);
        }
    }
}
exports.default = MapleBot;
