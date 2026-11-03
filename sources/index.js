"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_child_process_1 = require("node:child_process");
const env_1 = require("./shared/config/env");
const BASE_DELAY_MS = 2_000;
const MAX_DELAY_MS = 60_000;
// Si un servicio aguantó este tiempo, su caída se trata como la primera.
const STABLE_MS = 5 * 60_000;
const SHUTDOWN_TIMEOUT_MS = 10_000;
const services = [
    { name: 'http', entry: 'sources/web/index.js', failures: 0, startedAt: 0, disabled: false },
    { name: 'bot', entry: 'sources/bot/index.js', failures: 0, startedAt: 0, disabled: false }
];
let stopping = false;
function launch(service) {
    service.startedAt = Date.now();
    const child = (0, node_child_process_1.fork)(service.entry, [], { stdio: 'inherit' });
    service.child = child;
    child.on('exit', (code, signal) => {
        service.child = undefined;
        if (stopping)
            return finishIfIdle();
        if (code === env_1.CONFIG_ERROR_EXIT_CODE) {
            service.disabled = true;
            console.error(`[supervisor] ${service.name} no se relanza: falta configuración`);
            if (services.every((s) => s.disabled)) {
                console.error('[supervisor] Ningún servicio puede arrancar');
                process.exit(1);
            }
            return;
        }
        if (Date.now() - service.startedAt >= STABLE_MS)
            service.failures = 0;
        const delay = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** service.failures);
        service.failures++;
        console.error(`[supervisor] ${service.name} terminó (${signal ?? `código ${code}`}); se relanza en ${delay / 1000} s`);
        setTimeout(() => {
            if (!stopping)
                launch(service);
        }, delay);
    });
}
function finishIfIdle() {
    if (services.every((s) => !s.child))
        process.exit(0);
}
function shutdown() {
    if (stopping)
        return;
    stopping = true;
    console.info('[supervisor] Deteniendo servicios');
    for (const { child } of services) {
        if (child?.connected)
            child.send('shutdown');
    }
    // Por si un hijo no responde al mensaje.
    setTimeout(() => {
        for (const { child } of services)
            child?.kill();
        process.exit(0);
    }, SHUTDOWN_TIMEOUT_MS).unref();
    finishIfIdle();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
for (const service of services)
    launch(service);
