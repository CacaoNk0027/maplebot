"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const config_1 = require("../../../../bot/config/config");
const command_data_1 = __importDefault(require("../../../../bot/structs/command_data"));
const discord_js_1 = require("discord.js");
const command = {
    data: new command_data_1.default()
        .setName('verify')
        .setId('900', '001')
        .setDescription('Verificate para obtener acceso al servidor')
        .setContexts(discord_js_1.InteractionContextType.Guild),
    guild: "1146357424782049282",
    exec: async (interaction) => {
        await execute(interaction);
    },
    message: async (message, args) => {
        await execute(message);
    }
};
exports.command = command;
async function execute(target) {
    if (target instanceof discord_js_1.Message)
        await target.delete();
    else
        target.deferReply();
    if ((target.member?.roles).cache.size <= 0 ||
        !(target.member?.roles).cache.has('1147817071380541470')) {
        await (target.member?.roles).add('1147817071380541470');
        await (0, config_1.send)(target, 'ok', 'Verificado, puedes ingresar al servidor ahora', true);
    }
}
