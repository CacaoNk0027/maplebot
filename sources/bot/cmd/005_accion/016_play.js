"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const config_1 = require("../../../bot/config/config");
const action_1 = __importDefault(require("../../../bot/structs/action"));
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const discord_js_1 = require("discord.js");
const command = {
    data: new command_data_1.default()
        .setName('play')
        .setAliases('jugar', 'playing')
        .setDescription('Juega solo o en duo con alguien')
        .setId('016', '005')
        .setCooldown(5)
        .ignoreSlash()
        .validForLeveling()
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('Menciona a un usuario con el que quieras jugar')),
    exec: async () => {
        return;
    },
    message: async (message, args) => {
        execute(message, args);
    }
};
exports.command = command;
async function execute(target, args) {
    let play = new action_1.default(target, {
        args,
        action: 'playing'
    }).set_messages_for_author((author) => [
        `**${author.globalName || author.username}** se ha puesto a jugar`,
        `**${author.globalName || author.username}** esta jugando`
    ]).set_messages_for_user((author, user) => {
        let names = {
            for_author: author.globalName || author.username,
            for_user: user.globalName || user.username
        };
        return [
            `**${names.for_author}** se pone a jugar con **${names.for_user}**`,
            `**${names.for_author}** esta jugando con **${names.for_user}**`,
            `**${names.for_author}** y **${names.for_user}** juegan juntos`
        ];
    }).set_messages_for_bot((author) => [
        (0, config_1.reply)('ok', `juguemos un rato **${author.globalName || author.username}**`)
    ]).set_bot_can_be_mentioned(true);
    (await play.add_user()).execute();
}
