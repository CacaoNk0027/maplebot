"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const command_data_1 = __importDefault(require("../../structs/command_data"));
const command = {
    data: new command_data_1.default()
        .setName('read')
        .setAliases('leer')
        .setDescription('Ponte a leer algo')
        .setId('019', '005')
        .setCooldown(5)
        .ignoreSlash()
        .setInactive()
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
}
