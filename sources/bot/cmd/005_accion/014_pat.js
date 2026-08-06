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
const Action_1 = __importDefault(require("../../../shared/bot/models/Action"));
const command = {
    data: new command_data_1.default()
        .setName('pat')
        .setAliases('acariciar', 'caricia')
        .setDescription('Acaricia a alguien con mucho cariño')
        .setId('014', '005')
        .setCooldown(5)
        .ignoreSlash()
        .validForLeveling()
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setRequired(true)
        .setDescription('Menciona al usuario para acariciarlo')),
    exec: async () => {
        return;
    },
    message: async (message, args) => {
        execute(message, args);
    }
};
exports.command = command;
async function execute(target, args) {
    let pat = new action_1.default(target, {
        args,
        action: 'pat'
    }).set_bot_can_be_mentioned(true)
        .set_user_required(true)
        .set_messages_for_bot((author) => [
        (0, config_1.reply)('ok', `Déjame acariciarte con dulzura **${author.globalName || author.username}**`),
    ])
        .set_messages_for_user((author, user) => {
        Action_1.default.setTotalPerAction_ToUser('pat', user?.id);
        let names = {
            for_author: author.globalName || author.username,
            for_user: user.globalName || user.username
        };
        return [
            `**${names.for_author}** acaricia con mucho cariño a **${names.for_user}**`,
            `**${names.for_author}** le da una caricia a **${names.for_user}**`,
            `**${names.for_author}** está acariciando a **${names.for_user}**`,
            `**${names.for_author}** le da una caricia suave a **${names.for_user}**`,
            `**${names.for_user}** recibe una caricia de **${names.for_author}**`,
            `**${names.for_user}** está siendo acariciado por **${names.for_author}**`
        ];
    });
    (await pat.add_user()).execute();
}
