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
        .setName('peek')
        .setAliases('espiar', 'mirar')
        .setDescription('Echa un vistazo a alguien o algo con disimulo')
        .setId('015', '005')
        .setCooldown(5)
        .ignoreSlash()
        .validForLeveling()
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('Menciona al usuario a espiar')),
    exec: async () => {
        return;
    },
    message: async (message, args) => {
        execute(message, args);
    }
};
exports.command = command;
async function execute(target, args) {
    let peek = new action_1.default(target, {
        args,
        action: 'peek'
    }).set_messages_for_author((author) => [
        `**${author.globalName || author.username}** está echando un vistazo con disimulo`,
        `**${author.globalName || author.username}** está espiando cuidadosamente`
    ]).set_messages_for_user((author, user) => {
        let names = {
            for_author: author.globalName || author.username,
            for_user: user.globalName || user.username
        };
        return [
            `**${names.for_author}** espía con disimulo a **${names.for_user}**`,
            `**${names.for_author}** está mirando cuidadosamente a **${names.for_user}**`,
            `**${names.for_author}** mira con disimulo a **${names.for_user}**`
        ];
    }).set_bot_can_be_mentioned(false);
    (await peek.add_user()).execute();
}
