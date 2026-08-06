"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const command_data_1 = __importDefault(require("../../structs/command_data"));
const discord_js_1 = require("discord.js");
const action_1 = __importDefault(require("../../../bot/structs/action"));
const config_1 = require("../../../bot/config/config");
const command = {
    data: new command_data_1.default()
        .setName('cuddle')
        .setDescription('Acurrúcate con alguien y demuéstrale tu cariño')
        .setAliases('acurrucarse', 'acurrucar', 'cud')
        .setId('002', '005')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .ignoreSlash()
        .validForLeveling()
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('Menciona a un usuario para acurrucarte con él')),
    exec: async (interaction) => {
        return;
    },
    message: async (message, args) => {
        await execute(message, args);
    }
};
exports.command = command;
async function execute(target, args) {
    const cuddle = new action_1.default(target, {
        args,
        action: 'cuddle'
    }).set_user_required(true)
        .set_messages_for_user((author, user) => {
        let names = {
            for_user: user.globalName || user.username,
            author: author.globalName || author.username
        };
        return [
            `**${names.author}** se ha acurrucado con **${names.for_user}**`,
            `**${names.author}** ha dado suaves caricias a **${names.for_user}** con ternura`,
            `**${names.author}** le esta haciendo un gesto cariñoso a **${names.for_user}**`,
            `**${names.author}** y **${names.for_user}** se han acurrucado juntos`,
            `**${names.author}** muestra afecto a **${names.for_user}**`
        ];
    }).set_bot_can_be_mentioned(true)
        .set_messages_for_bot(() => [(0, config_1.reply)('ok', 'Es lindo estar acurrucada contigo <3')]);
    await (await cuddle.add_user()).execute();
}
