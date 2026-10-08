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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_connect_1 = __importDefault(require("../../shared/config/db_connect"));
const Infraction_1 = require("../../shared/bot/models/Infraction");
const bot_1 = __importDefault(require("../structs/bot"));
const neekuro = __importStar(require("neekuro"));
(0, db_connect_1.default)(process.env.URI_DBBOT).then(Infraction_1.syncInfractionRetention);
const client = new bot_1.default();
const user = new neekuro.User(process.env.NEEKURO);
// El paquete trae la URL del API como valor por defecto, así que un cambio de
// dominio obligaría a publicar una versión nueva y a que todos la instalaran.
// Fijarla aquí desacopla al bot de eso, y la variable permite apuntar a otro
// entorno sin tocar el código.
neekuro.SFW.setBaseURL(process.env.NEEKURO_API?.trim() || 'https://maplebot.fyi/api/sfw');
client.start();
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
