"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const action_1 = __importDefault(require("../../../bot/structs/action"));
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const discord_js_1 = require("discord.js");
const Action_1 = __importDefault(require("../../../shared/bot/models/Action"));
const command = {
    data: new command_data_1.default()
        .setName('kiss')
        .setAliases('besar')
        .setDescription('Da besos a la persona que mas quieres')
        .setId('012', '005')
        .setCooldown(5)
        .ignoreSlash()
        .validForLeveling()
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setRequired(true)
        .setDescription('Menciona al usuario para besarlo')),
    exec: async () => {
        return;
    },
    message: async (message, args) => {
        execute(message, args);
    }
};
exports.command = command;
async function execute(target, args) {
    let kiss = new action_1.default(target, {
        args,
        action: 'kiss'
    })
        .set_bot_can_be_mentioned(false)
        .set_user_required(true)
        .set_messages_for_user((author, user) => {
        Action_1.default.setForUser('kiss', author.id, user?.id);
        let names = {
            for_author: author.globalName || author.username,
            for_user: user.globalName || user.username
        };
        return [
            `**${names.for_author}** ha dado un beso a **${names.for_user}**`,
            `**${names.for_author}** besa a **${names.for_user}**`,
            `**${names.for_author}** ha besado a **${names.for_user}**`,
            `**${names.for_author}** le da un beso a **${names.for_user}**`
        ];
    });
    (await kiss.add_user()).execute();
}
