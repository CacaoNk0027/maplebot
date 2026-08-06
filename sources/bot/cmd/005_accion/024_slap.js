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
        .setName('slap')
        .setAliases('bofetear')
        .setDescription('Bofetea a una persona')
        .setId('024', '005')
        .setCooldown(5)
        .validForLeveling()
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .ignoreSlash()
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setRequired(true)
        .setDescription('Menciona a un usuario')),
    exec: async () => { },
    message: async (message, args) => {
    }
};
exports.command = command;
async function execute(target, args) {
    let slap = new action_1.default(target, {
        args,
        action: 'slap'
    }).set_bot_can_be_mentioned(false)
        .set_user_required(true)
        .set_messages_for_user((author, user) => {
        Action_1.default.setTotalPerAction_ToUser('slap', user?.id);
        let name = {
            author: author.globalName || author.username,
            user: user?.globalName || user?.username
        };
        return [
            `**${name.author}** le da una bofetada a **${name.user}**`,
            `**${name.user}** recibe una bofetada de **${name.author}**`,
            `**${name.author}** ha bofeteado a **${name.user}**`
        ];
    });
    (await slap.add_user()).execute();
}
