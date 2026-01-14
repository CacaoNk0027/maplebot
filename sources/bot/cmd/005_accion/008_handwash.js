"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const command = {
    data: new command_data_1.default()
        .setName('handwash')
        .setAliases('hdw', 'handw')
        .setDescription('Lavate las manos antes de comer o hacer algo')
        .setId('008', '005')
        .setCooldown(5)
        .ignoreSlash()
        .setInactive(),
    exec: async (interaction) => {
        return;
    },
    message: async (message, args) => {
        execute(message, args);
    }
};
exports.command = command;
async function execute(target, args) {
    // new ActionCommand(target, {
    //     args,
    //     action: 'handwashing'
    // })
    // el tipo handwashing no existe, hay que crearlo, despues lo agrego a la api
}
