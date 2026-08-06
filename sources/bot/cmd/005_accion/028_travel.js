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
        .setName('travel')
        .setAliases('viajar')
        .setDescription('Alista las maletas y viaja')
        .setId('028', '005')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .ignoreSlash()
        .validForLeveling(),
    exec: async () => {
        return;
    },
    message: async (message, args) => {
        execute(message, args);
    }
};
exports.command = command;
async function execute(target, args) {
    let travel = new action_1.default(target, {
        args,
        action: 'travel'
    })
        .set_messages_for_author(author => {
        let names = {
            for_author: author.globalName || author.username
        };
        return [
            `**${names.for_author}** está viajando`,
            `**${names.for_author}** ha emprendido un viaje`,
            `**${names.for_author}** alista maletas para viajar`
        ];
    });
    travel.execute();
}
