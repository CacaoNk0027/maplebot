"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const event_handler_1 = require("../config/event_handler");
const interaction_handler_1 = require("../config/interaction_handler");
const set_commands_1 = require("../../bot/config/set_commands");
const config_1 = require("../../bot/config/config");
const packageJson = require('../../../package.json');
class MapleBot {
    client;
    precences = [
        "Todo bien? todo correcto?",
        "Te bendigo Dr. Syndrome",
        "Actualizacion en curso...",
        "Oye, no nada",
        "Miyabi my beloved",
        "Programando Typescript"
    ];
    constructor() {
        this.client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMembers,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
                discord_js_1.GatewayIntentBits.AutoModerationConfiguration,
                discord_js_1.GatewayIntentBits.AutoModerationExecution
            ],
            allowedMentions: {
                repliedUser: false
            }
        });
    }
    async start() {
        try {
            await this.handlers();
            await this.client.login(process.env['BOT_TOKEN']);
            // Cada shard es un proceso completo, asi que sin esta comprobacion
            // todos registrarian la misma lista de comandos globales. Sin
            // sharding, client.shard es null y el registro debe ocurrir igual.
            if (!this.client.shard || this.client.shard.ids.includes(0)) {
                await (0, set_commands_1.set_commands)(this.client.application?.id || this.client.user?.id || process.env['bot_id']);
            }
            this.client.user?.setPresence({
                activities: [{
                        name: `m!maple 🍁 | ${packageJson.version} | ${(0, config_1.rand)(this.precences)}`,
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
            await (0, interaction_handler_1.load_interactions)();
            await (0, interaction_handler_1.load_modals)();
            await (0, event_handler_1.events)(this.client);
            console.info('>>> Handlers cargados correctamente');
        }
        catch (error) {
            console.error('[ERR]! Error al iniciar handlers:', error);
        }
    }
}
exports.default = MapleBot;
