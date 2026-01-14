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
        .setName('cure')
        .setDescription('Curate a ti mismo o a alguien')
        .setAliases()
        .setId('003', '005')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .ignoreSlash()
        .validForLeveling()
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('Menciona al usuario para curarlo')),
    exec: async (interaction) => {
        return;
    },
    message: async (message, args) => {
        await execute(message, args);
    }
};
exports.command = command;
async function execute(target, args) {
    const cure = new action_1.default(target, {
        args,
        action: 'cure'
    }).set_messages_for_author((author) => {
        let name = author.globalName || author.username;
        return [
            `**${name}** se ha curado a si mismo`
        ];
    }).set_messages_for_user((author, user) => {
        let names = {
            for_user: user.globalName || user.username,
            author: author.globalName || author.username
        };
        return [
            `**${names.author}** esta curando a **${names.for_user}**`
        ];
    }).set_bot_can_be_mentioned(true).set_messages_for_bot(() => [
        (0, config_1.reply)('ok', 'Te curare con mucho cuidado')
    ]);
    await (await cure.add_user()).execute();
}
