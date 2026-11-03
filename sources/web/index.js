"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("../shared/config/env");
const start_1 = __importStar(require("./start"));
// Entrada del servidor HTTP. Qué módulos enciende sale, por orden, del primer
// argumento o de HTTP_MODULES (separados por comas); sin ninguno, los dos.
//   node sources/web/index.js web   (pnpm run start:web)
//   node sources/web/index.js api   (pnpm run start:api)
// El supervisor de `src/index.ts` lo lanza sin argumento.
(0, env_1.loadEnvironment)('http', ['URI_NEEKURO']);
const requested = (process.argv[2] || process.env.HTTP_MODULES || start_1.HTTP_MODULES.join(','))
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
const unknown = requested.filter((name) => !start_1.HTTP_MODULES.includes(name));
if (unknown.length > 0 || requested.length === 0) {
    console.error(`[http] Módulos desconocidos: ${unknown.join(', ') || '(ninguno)'}. Usa web, api o los dos.`);
    process.exit(env_1.CONFIG_ERROR_EXIT_CODE);
}
const modules = new Set(requested);
// Las sesiones solo existen en la web; el API no necesita SESSION.
if (modules.has('web'))
    (0, env_1.loadEnvironment)('web', ['SESSION']);
(0, env_1.onShutdown)(() => process.exit(0));
(0, start_1.default)(modules);
