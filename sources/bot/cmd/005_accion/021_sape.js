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
        .setName('sape')
        .setDescription('Dale un sape a un usuario')
        .setId('021', '005')
        .setCooldown(5)
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .ignoreSlash()
        .validForLeveling()
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setRequired(true)
        .setDescription('Menciona a un usuario')),
    exec: async () => { },
    message: async (message, args) => {
        await execute(message, args);
    }
};
exports.command = command;
async function execute(target, args) {
    let sape = new action_1.default(target, {
        args,
        action: 'sape'
    }).set_bot_can_be_mentioned(false)
        .set_user_required(true)
        .set_messages_for_user((author, user) => {
        Action_1.default.setTotalPerAction_ToUser('punch', user?.id);
        let name = {
            author: author.globalName || author.username,
            user: user?.globalName || user?.username
        };
        return [
            `**${name.author}** le da de sapes a **${name.user}**`,
            `**${name.author}** le da un sape a **${name.user}**`,
            `**${name.user}** recibe un sape de **${name.author}**`
        ];
    });
    (await sape.add_user()).execute();
}
