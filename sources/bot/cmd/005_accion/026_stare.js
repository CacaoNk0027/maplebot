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
        .setName('stare')
        .setAliases('mirar', 'observar')
        .setDescription('Mira fijamente a algo o alguien')
        .setId('026', '005')
        .setCooldown(5)
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .ignoreSlash()
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
    let stare = new action_1.default(target, {
        args,
        action: 'stare'
    }).set_bot_can_be_mentioned(true)
        .set_messages_for_user((author, user) => {
        let names = {
            for_author: author.globalName || author.username,
            for_user: user.globalName || user.username
        };
        return [
            `**${names.for_author}** está mirando fijamente a **${names.for_user}**`,
            `**${names.for_author}** no puede dejar de observar a **${names.for_user}**`,
            `**${names.for_author}** clava su mirada en **${names.for_user}**`
        ];
    }).set_messages_for_author((author) => [
        `**${author.globalName || author.username}** está mirando fijamente a algo`,
        `Alguna cosa capta la mirada de **${author.globalName || author.username}**`,
        `**${author.globalName || author.username}** no puede dejar de observar algo`
    ]).set_messages_for_bot((author => [
        `Te observare fijamente **${author.globalName || author.username}**`
    ]));
    (await stare.add_user()).execute();
}
