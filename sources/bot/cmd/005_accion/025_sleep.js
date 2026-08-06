"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const action_1 = __importDefault(require("../../../bot/structs/action"));
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const discord_js_1 = require("discord.js");
const config_1 = require("../../../bot/config/config");
const command = {
    data: new command_data_1.default()
        .setName('sleep')
        .setAliases('dormir')
        .setDescription('Duerme junto a la persona que mas quieres')
        .setId('025', '005')
        .setCooldown(5)
        .ignoreSlash()
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .validForLeveling()
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('Menciona al usuario')),
    exec: async () => {
        return;
    },
    message: async (message, args) => {
        execute(message, args);
    }
};
exports.command = command;
async function execute(target, args) {
    let sleep = new action_1.default(target, {
        args,
        action: 'sleep'
    }).set_bot_can_be_mentioned(true)
        .set_messages_for_user((author, user) => {
        let names = {
            for_author: author.globalName || author.username,
            for_user: user.globalName || user.username
        };
        return [
            `**${names.for_author}** ha dormido junto a **${names.for_user}**`,
            `**${names.for_author}** duerme con **${names.for_user}**`,
            `**${names.for_author}** esta durmiendo con **${names.for_user}**`
        ];
    }).set_messages_for_author((author) => [
        `**${author.globalName || author.username}** se ha ido a dormir`
    ]).set_messages_for_bot((author => [
        (0, config_1.reply)('ok', `shh... duerme bien, yo cuidare de ti **${author.globalName || author.username}**`)
    ]));
    (await sleep.add_user()).execute();
}
