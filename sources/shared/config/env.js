"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG_ERROR_EXIT_CODE = void 0;
exports.loadEnvironment = loadEnvironment;
exports.onShutdown = onShutdown;
const dotenv_1 = __importDefault(require("dotenv"));
// Código de salida para «falta configuración». El supervisor no relanza un
// servicio que sale con él, porque volver a arrancar daría el mismo error.
exports.CONFIG_ERROR_EXIT_CODE = 78;
// Carga .env y comprueba solo las variables que necesita este servicio: la web
// no necesita BOT_TOKEN y el bot no necesita SESSION.
function loadEnvironment(service, required) {
    dotenv_1.default.config();
    const missing = required.filter((name) => !process.env[name]?.trim());
    if (missing.length > 0) {
        console.error(`[${service}] Faltan variables de entorno requeridas: ${missing.join(', ')}`);
        process.exit(exports.CONFIG_ERROR_EXIT_CODE);
    }
}
// Cierra el servicio cuando lo pide el supervisor o cuando este desaparece. Se
// usa un mensaje por IPC y no una señal porque en Windows `kill()` termina el
// proceso de golpe, sin dejarle limpiar.
function onShutdown(handler) {
    let called = false;
    const run = () => {
        if (called)
            return;
        called = true;
        handler();
    };
    process.on('message', (message) => {
        if (message === 'shutdown')
            run();
    });
    process.on('disconnect', run);
    process.on('SIGINT', run);
    process.on('SIGTERM', run);
}
