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
        .setName('tickle')
        .setAliases('cosquillas')
        .setDescription('Dale cosquillas a alguien')
        .setId('027', '005')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .ignoreSlash()
        .validForLeveling()
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('Menciona al usuario')
        .setRequired(true)),
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
        action: 'tickle'
    }).set_bot_can_be_mentioned(true)
        .set_user_required(true)
        .set_bot_can_be_mentioned(true)
        .set_messages_for_user((author, user) => {
        let names = {
            for_author: author.globalName || author.username,
            for_user: user.globalName || user.username
        };
        return [
            `**${names.for_author}** le ha hecho cosquillas a **${names.for_user}**`,
            `**${names.for_author}** está haciendo reír a **${names.for_user}** con cosquillas`,
            `**${names.for_author}** ha atacado a **${names.for_user}** con cosquillas`
        ];
    }).set_messages_for_bot((author => [
        `Cosquillas!`
    ]));
    (await stare.add_user()).execute();
}
