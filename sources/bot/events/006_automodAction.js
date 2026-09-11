"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const automod_log_1 = require("../structs/automod_log");
const automod_infractions_1 = require("../structs/automod_infractions");
const automod_escalation_1 = require("../structs/automod_escalation");
const event = {
    name: discord_js_1.Events.AutoModerationActionExecution,
    async exec(execution) {
        // El historial y el registro en canal son independientes: si uno falla,
        // el otro debe seguir funcionando.
        await (0, automod_infractions_1.recordAutoModInfraction)(execution).catch(error => {
            console.error('[AutoModerationActionExecution:ERR] No se pudo guardar la infracción:', error);
        });
        try {
            await (0, automod_log_1.logAutoModExecution)(execution);
        }
        catch (error) {
            console.error('[AutoModerationActionExecution:ERR] No se pudo registrar la ejecución:', error);
        }
        // El escalado va al final: necesita la infracción ya guardada para
        // contarla, y no debe impedir el registro si falla.
        await (0, automod_escalation_1.applyAutoModEscalation)(execution).catch(error => {
            console.error('[AutoModerationActionExecution:ERR] No se pudo aplicar el escalado:', error);
        });
    }
};
exports.default = event;
