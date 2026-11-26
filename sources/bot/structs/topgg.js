"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VOTE_URL = void 0;
exports.getVoteStatus = getVoteStatus;
exports.startServerCountUpdates = startServerCountUpdates;
/**
 * Integración con Top.gg (API v1): publica el número de servidores y consulta
 * si alguien tiene un voto activo. Todo es opcional: sin `TOP_GG_TOKEN`, o si
 * Top.gg no responde, Maple sigue igual y `vote` solo muestra el enlace.
 */
const API = 'https://top.gg/api/v1/projects/@me';
// El bot de prueba hereda el token en `pnpm test`; solo el de producción publica.
const MAPLE_ID = '821452429409124451';
const REQUEST_TIMEOUT_MS = 10_000;
const SERVER_COUNT_INTERVAL_MS = 30 * 60 * 1000;
const VOTE_CACHE_MS = 60 * 1000;
const MAX_CACHED_VOTES = 500;
exports.VOTE_URL = `https://top.gg/bot/${MAPLE_ID}/vote`;
const voteCache = new Map();
function token() {
    return process.env.TOP_GG_TOKEN?.trim() || undefined;
}
async function request(path, init = {}) {
    const auth = token();
    if (!auth)
        return null;
    const response = await fetch(`${API}${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${auth}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
    // Superar el límite bloquea el token una hora, y repetirlo puede costar la ficha.
    if (response.status === 429) {
        console.warn(`[TopGG:WARN] Límite de peticiones alcanzado en ${path}`);
    }
    return response;
}
/**
 * Devuelve si el usuario tiene un voto activo, o `null` si no se pudo saber.
 * Se cachea un minuto para que varios `vote` seguidos no gasten peticiones.
 */
async function getVoteStatus(userId) {
    const cached = voteCache.get(userId);
    if (cached && cached.expiresAt > Date.now())
        return cached.status;
    try {
        const response = await request(`/votes/${userId}?source=discord`);
        if (!response)
            return null;
        let status;
        if (response.status === 404) {
            status = { voted: false };
        }
        else if (response.ok) {
            const vote = await response.json();
            const expiresAt = vote.expires_at ? new Date(vote.expires_at) : null;
            status = expiresAt && expiresAt.getTime() > Date.now()
                ? { voted: true, expiresAt }
                : { voted: false };
        }
        else {
            return null;
        }
        if (voteCache.size >= MAX_CACHED_VOTES) {
            const oldest = voteCache.keys().next().value;
            if (oldest)
                voteCache.delete(oldest);
        }
        voteCache.set(userId, { status, expiresAt: Date.now() + VOTE_CACHE_MS });
        return status;
    }
    catch (error) {
        console.error('[TopGG:ERR] No se pudo consultar el voto:', error);
        return null;
    }
}
async function postServerCount(manager) {
    const counts = await manager.fetchClientValues('guilds.cache.size');
    const serverCount = counts.reduce((total, count) => total + count, 0);
    const response = await request('/metrics', {
        method: 'PATCH',
        body: JSON.stringify({ server_count: serverCount, shard_count: manager.shards.size })
    });
    if (response && !response.ok) {
        console.error(`[TopGG:ERR] Top.gg rechazó el número de servidores (${response.status})`);
    }
}
/**
 * Publica el número de servidores al arrancar y cada 30 minutos. Se llama desde
 * el `ShardingManager`, que es el único que ve todas las shards a la vez.
 */
async function startServerCountUpdates(manager) {
    if (!token() || process.env.NODE_ENV === 'test')
        return;
    const [botId] = await manager.fetchClientValues('user.id');
    if (botId !== MAPLE_ID)
        return;
    const publish = () => postServerCount(manager).catch((error) => {
        console.error('[TopGG:ERR] No se pudo publicar el número de servidores:', error);
    });
    await publish();
    setInterval(publish, SERVER_COUNT_INTERVAL_MS);
    console.info('[TopGG] Número de servidores publicado; se actualiza cada 30 min');
}
