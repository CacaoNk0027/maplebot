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
exports.load_interactions = load_interactions;
const discord_js_1 = require("discord.js");
const config_1 = require("./config");
const fs_1 = require("fs");
async function load_interactions() {
    const interactions = new discord_js_1.Collection();
    try {
        let folders = (0, fs_1.readdirSync)(`${config_1.branch}/interactions`);
        for (let folder of folders) {
            let files = (0, fs_1.readdirSync)(`${config_1.branch}/interactions/${folder}`).filter(file => file.endsWith(".js"));
            for (let file of files) {
                try {
                    const module = (await Promise.resolve(`${`../interactions/${folder}/${file}`}`).then(s => __importStar(require(s))));
                    let interaction = module.interaction;
                    if (!interaction.data.id) {
                        console.warn(`[InteractionHandler:WARN] => El archivo ${file} no tiene informacion`);
                        continue;
                    }
                    interactions.set(interaction.data.id, interaction);
                }
                catch (error) {
                    console.error(`Error al cargar interaccion ${file}:`, error);
                }
            }
        }
        return interactions;
    }
    catch (error) {
        console.error('Error al cargar interacciones:', error);
        throw error;
    }
}
