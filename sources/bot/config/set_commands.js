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
exports.set_commands = set_commands;
const fs_1 = require("fs");
const config_1 = require("./config");
const discord_js_1 = require("discord.js");
let collection = new Map();
let private_commands = new Map();
async function get_data() {
    try {
        let folders = (0, fs_1.readdirSync)(`${config_1.branch}/cmd`);
        await Promise.all(folders.map(async (dir) => {
            let files = (0, fs_1.readdirSync)(`${config_1.branch}/cmd/${dir}`).filter(f => f.endsWith('.js'));
            for (let file of files) {
                try {
                    const module = await Promise.resolve(`${`../cmd/${dir}/${file}`}`).then(s => __importStar(require(s)));
                    let command = module.command;
                    let { alias, slash, category, bot_permissions, id, user_permissions, inactive, ...rest } = command.data;
                    if (!command.data.slash)
                        continue;
                    collection.set(command.data.name, rest);
                }
                catch (error) {
                    console.error('Error al cargar comando', `${dir}/${file}:`, error);
                }
            }
        }));
    }
    catch (error) {
        console.error('Error al cargar comandos:', error);
    }
}
async function get_private_commands_data() {
    try {
        let private_branch = 'sources/bot/private';
        let folders = (0, fs_1.readdirSync)(`${private_branch}/cmd`);
        await Promise.all(folders.map(async (dir) => {
            let files = (0, fs_1.readdirSync)(`${private_branch}/cmd/${dir}`).filter(f => f.endsWith('.js'));
            for (let file of files) {
                try {
                    const module = await Promise.resolve(`${`../private/cmd/${dir}/${file}`}`).then(s => __importStar(require(s)));
                    let command = module.command;
                    let { alias, slash, category, bot_permissions, id, user_permissions, inactive, ...rest } = command.data;
                    if (!command.data.slash)
                        continue;
                    private_commands.set(command.data.name, { guild: command.guild, data: rest });
                }
                catch (error) {
                    console.error('Error al cargar comando', `${dir}/${file}:`, error);
                }
            }
        }));
    }
    catch (error) {
        console.error('Error al cargar comandos:', error);
    }
}
async function set_commands(clientId) {
    const rest = new discord_js_1.REST().setToken(process.env['BOT_TOKEN']);
    await get_data().then(async () => {
        let commands = [...collection.values()];
        try {
            console.info('>>> Carga de comandos de barra iniciada [/]');
            await rest.put(discord_js_1.Routes.applicationCommands(clientId), {
                body: commands
            }).then(() => {
                console.info('>>> La carga de comandos ha finalizado');
            });
        }
        catch (error) {
            console.error('[ERR]! La carga de comandos fue interrumpida por un error:', error);
        }
    });
    await get_private_commands_data().then(async () => {
        let private_commands_data = [...private_commands.values()];
        try {
            await rest.put(discord_js_1.Routes.applicationGuildCommands(clientId, private_commands_data[0].guild), {
                body: private_commands_data.map(cmd => cmd.data)
            });
        }
        catch (error) {
            console.error(error);
        }
    });
}
