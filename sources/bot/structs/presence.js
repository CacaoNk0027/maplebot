"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presenceData = presenceData;
exports.applyPresence = applyPresence;
exports.startPresenceRotation = startPresenceRotation;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const packageJson = require('../../../package.json');
const frases = [
    "Todo bien? todo correcto?",
    "Te bendigo Dr. Syndrome",
    "Actualizacion en curso...",
    "Oye, no nada",
    "Miyabi my beloved",
    "Programando Typescript"
];
let frase = (0, config_1.rand)(frases);
function presenceData() {
    return {
        activities: [{
                name: `m!maple 🍁 | ${packageJson.version} | ${frase}`,
                type: discord_js_1.ActivityType.Playing
            }],
        status: 'idle'
    };
}
/**
 * Repone la presencia en la conexión actual.
 *
 * `setPresence` solo envía un PRESENCE_UPDATE por la conexión abierta y no deja
 * nada guardado: lo que viaja en cada IDENTIFY es `options.presence`. Por eso
 * la presencia se pasa también al construir el cliente y se repone al
 * reconectar, o el estado desaparece cuando Discord invalida la sesión.
 */
function applyPresence(client) {
    client.user?.setPresence(presenceData());
}
/**
 * Arranca la rotación diaria de frases.
 *
 * Cada cambio se programa para la medianoche siguiente y, al ejecutarse, vuelve
 * a programar el próximo. Se hace así en vez de con un intervalo de 24 h por
 * dos motivos: la frase cambia al cambiar el día y no 24 h después de arrancar,
 * que iría derivando con cada reinicio; y recalcular la espera cada vez la deja
 * inmune a los cambios de horario de verano.
 *
 * Se llama una vez tras iniciar sesión. Si la sesión se rehace, `applyPresence`
 * repone la frase vigente, así que la programación no necesita reiniciarse.
 */
function startPresenceRotation(client) {
    const programar = () => {
        setTimeout(() => {
            frase = nextPhrase();
            applyPresence(client);
            programar();
        }, msHastaMedianoche());
    };
    programar();
}
/** Milisegundos que faltan para la próxima medianoche local. */
function msHastaMedianoche() {
    const ahora = new Date();
    const medianoche = new Date(ahora);
    medianoche.setHours(24, 0, 0, 0);
    return medianoche.getTime() - ahora.getTime();
}
/** Evita repetir la frase vigente, que pasaría desapercibido como cambio. */
function nextPhrase() {
    if (frases.length < 2)
        return frases[0];
    let candidata = frase;
    while (candidata === frase)
        candidata = (0, config_1.rand)(frases);
    return candidata;
}
