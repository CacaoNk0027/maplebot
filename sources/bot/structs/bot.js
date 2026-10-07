"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const event_handler_1 = require("../config/event_handler");
const interaction_handler_1 = require("../config/interaction_handler");
const set_commands_1 = require("../../bot/config/set_commands");
const presence_1 = require("./presence");
class MapleBot {
    client;
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
            },
            // Va en las opciones para que viaje en cada IDENTIFY. El valor por
            // defecto es {}, que se envía igual y deja al bot sin estado.
            presence: (0, presence_1.presenceData)(),
            // Sin estos parciales Discord no emite los eventos de mensajes que
            // el bot no tiene en caché, y los borrados antiguos no se registrarían.
            partials: [discord_js_1.Partials.Message, discord_js_1.Partials.Channel, discord_js_1.Partials.GuildMember],
            // La caché de mensajes es lo único que permite registrar el texto de
            // un mensaje borrado o editado. Se acota a propósito: con cientos de
            // servidores, sin tope crece hasta comerse la memoria.
            makeCache: discord_js_1.Options.cacheWithLimits({
                ...discord_js_1.Options.DefaultMakeCacheSettings,
                MessageManager: 200
            }),
            sweepers: {
                ...discord_js_1.Options.DefaultSweeperSettings,
                messages: { interval: 1_800, lifetime: 3_600 }
            }
        });
        // Red de seguridad por si la sesión se rehace: reponerla al conectar
        // una shard y al reanudar cuesta nada y evita quedarse sin estado.
        this.client.on(discord_js_1.Events.ShardReady, () => (0, presence_1.applyPresence)(this.client));
        this.client.on(discord_js_1.Events.ShardResume, () => (0, presence_1.applyPresence)(this.client));
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
            (0, presence_1.startPresenceRotation)(this.client);
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
