"use strict";
/**
 * Catálogo de registros.
 *
 * Añadir un tipo nuevo es una entrada aquí más el evento que lo emite: ni el
 * modelo ni el panel de configuración necesitan cambios, porque los dos se
 * construyen a partir de esta tabla.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOG_EVENT_KEYS = exports.LOG_EVENTS = exports.LOG_CATEGORIES = void 0;
exports.isLogEventKey = isLogEventKey;
exports.eventsByCategory = eventsByCategory;
exports.eventLabelKey = eventLabelKey;
exports.eventHintKey = eventHintKey;
exports.categoryLabelKey = categoryLabelKey;
exports.LOG_CATEGORIES = ['messages', 'members', 'automod'];
exports.LOG_EVENTS = {
    'message.delete': { category: 'messages', needsMessageContent: true, enabledByDefault: true },
    'message.edit': { category: 'messages', needsMessageContent: true, enabledByDefault: true },
    'message.purge': { category: 'messages', needsMessageContent: true, enabledByDefault: true },
    'member.join': { category: 'members', needsMessageContent: false, enabledByDefault: true },
    'member.leave': { category: 'members', needsMessageContent: false, enabledByDefault: true },
    'automod.executions': { category: 'automod', needsMessageContent: false, enabledByDefault: true },
    'automod.rules': { category: 'automod', needsMessageContent: false, enabledByDefault: true }
};
exports.LOG_EVENT_KEYS = Object.keys(exports.LOG_EVENTS);
function isLogEventKey(value) {
    return value in exports.LOG_EVENTS;
}
function eventsByCategory(category) {
    return exports.LOG_EVENT_KEYS.filter(key => exports.LOG_EVENTS[key].category === category);
}
/** Clave de traducción del nombre de un evento o de una categoría. */
function eventLabelKey(key) {
    return `log.event.${key}`;
}
function eventHintKey(key) {
    return `log.event.${key}.hint`;
}
function categoryLabelKey(category) {
    return `log.category.${category}`;
}
