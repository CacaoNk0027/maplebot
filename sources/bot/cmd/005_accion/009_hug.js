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
const Action_1 = __importDefault(require("../../../shared/bot/models/Action"));
const command = {
    data: new command_data_1.default()
        .setName('hug')
        .setAliases('abrazo', 'abrazar')
        .setDescription('Da un abrazo a alguien')
        .setId('009', '005')
        .setCooldown(5)
        .ignoreSlash()
        .validForLeveling()
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setRequired(true)
        .setDescription('Menciona al usuario para abrazarlo')),
    exec: async (interaction) => {
        return;
    },
    message: async (message, args) => {
        execute(message, args);
        return;
    }
};
exports.command = command;
async function execute(target, args) {
    let hug = new action_1.default(target, {
        args,
        action: 'hug'
    }).set_messages_for_bot((author) => [(0, config_1.reply)('ok', `Ven aquí **${author.globalName || author.username}** que te daré un abrazo`)])
        .set_messages_for_user((author, user) => {
        Action_1.default.setTotalPerAction_ToUser('hug', user?.id);
        let names = {
            for_author: author.globalName || author.username,
            for_user: user.globalName || user.username
        };
        return [
            `**${names.for_author}** le da un abrazo a **${names.for_user}**`,
            `**${names.for_author}** abraza a **${names.for_user}**`,
            `**${names.for_author}** está abrazando a **${names.for_user}**`,
            `**${names.for_author}** abraza con cariño a **${names.for_user}**`
        ];
    }).set_user_required(true).set_bot_can_be_mentioned(true);
    (await hug.add_user()).execute();
}
