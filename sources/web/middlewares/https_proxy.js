"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * El proxy de Sparked Host termina el HTTPS y reenvía la petición en HTTP sin
 * la cabecera X-Forwarded-Proto. Sin ella Express cree que la conexión no es
 * segura y express-session descarta en silencio la cookie de sesión, que en
 * producción es `secure`: el login responde bien pero la sesión no llega.
 *
 * Al tráfico público solo se llega por ese proxy, que ya redirige HTTP a
 * HTTPS, así que en producción la ausencia de la cabecera equivale a HTTPS.
 * Si alguien entra directo por IP:puerto en HTTP, su navegador rechazará la
 * cookie `secure`, que es el comportamiento correcto.
 */
function assumeHttpsBehindProxy(req, _res, next) {
    if (!req.headers['x-forwarded-proto'])
        req.headers['x-forwarded-proto'] = 'https';
    next();
}
exports.default = assumeHttpsBehindProxy;
