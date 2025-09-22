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
exports.events = events;
const config_1 = require("./config");
const fs_1 = require("fs");
async function events(client) {
    try {
        let files = (0, fs_1.readdirSync)(config_1.branch + '/events').filter(f => f.endsWith('.js'));
        for (let file of files) {
            let event = (await Promise.resolve(`${'../events/' + file}`).then(s => __importStar(require(s)))).default;
            if (!event.name) {
                console.warn('[EventHandler:WARN] => El archivo', file, 'no contiene informacion');
                continue;
            }
            if (event.once) {
                client.once(event.name, (...args) => event.exec(...args));
            }
            else {
                client.on(event.name, (...args) => event.exec(...args));
            }
            console.info('[EventHandler] => Evento', event.name, 'cargado');
        }
        private_events(client);
    }
    catch (error) {
        console.error('Error al cargar eventos:', error);
    }
}
async function private_events(client) {
    let private_branch = 'dist/bot/private';
    try {
        let files = (0, fs_1.readdirSync)(private_branch + '/events').filter(f => f.endsWith('.js'));
        for (let file of files) {
            let event = (await Promise.resolve(`${'../private/events/' + file}`).then(s => __importStar(require(s)))).default;
            if (!event.name) {
                console.warn('[EventHandler:WARN] => El archivo', file, 'no contiene informacion');
                continue;
            }
            if (event.once) {
                client.once(event.name, (...args) => event.exec(...args));
            }
            else {
                client.on(event.name, (...args) => event.exec(...args));
            }
            console.info('[EventHandler] => Evento', event.name, 'cargado');
        }
    }
    catch (error) {
        console.error('Error al cargar eventos:', error);
    }
}
