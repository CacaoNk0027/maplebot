"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordAutoModInfraction = recordAutoModInfraction;
const Infraction_1 = __importDefault(require("../../shared/bot/models/Infraction"));
const automod_1 = require("./automod");
const MATCH_LIMIT = 200;
const UNKNOWN_RULE = 'Regla desconocida';
/**
 * Guarda la infracción en la base de datos.
 *
 * A diferencia del registro en canal, esto se ejecuta siempre: un servidor sin
 * canal de logs configurado también necesita acumular historial para que el
 * escalado por reincidencia funcione.
 */
async function recordAutoModInfraction(execution) {
    const { guild } = execution;
    if (!guild || !execution.userId)
        return;
    const rule = await (0, automod_1.fetchAutoModRule)(guild, execution.ruleId);
    const matched = execution.matchedKeyword || execution.matchedContent || null;
    await Infraction_1.default.record({
        guildId: guild.id,
        userId: execution.userId,
        source: 'automod',
        ruleId: execution.ruleId,
        ruleName: rule?.name ?? UNKNOWN_RULE,
        triggerType: execution.ruleTriggerType,
        actionType: execution.action.type,
        channelId: execution.channelId ?? null,
        matched: matched ? matched.slice(0, MATCH_LIMIT) : null
    });
}
