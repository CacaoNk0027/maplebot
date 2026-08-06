"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const action_1 = __importDefault(require("../../../bot/structs/action"));
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const discord_js_1 = require("discord.js");
const command = {
    data: new command_data_1.default()
        .setName('draw')
        .setAliases('dibujar')
        .setDescription('Toma el lapiz y comienza a dibujar')
        .setAliases()
        .setId('004', '005')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .ignoreSlash()
        .validForLeveling(),
    exec: async (interaction) => {
        return;
    },
    message: async (message, args) => {
        await execute(message, args);
    }
};
exports.command = command;
async function execute(target, args) {
    new action_1.default(target, {
        args,
        action: 'draw'
    }).set_messages_for_author((author) => {
        let name = author.globalName || author.username;
        return [
            `**${name}** ha comenzado a dibujar`
        ];
    }).set_bot_can_be_mentioned(false)
        .execute();
}
