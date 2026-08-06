"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const Action_1 = __importDefault(require("../../../shared/bot/models/Action"));
const action_1 = __importDefault(require("../../../bot/structs/action"));
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const discord_js_1 = require("discord.js");
const command = {
    data: new command_data_1.default()
        .setName('punch')
        .setAliases('golpear')
        .setDescription('Golpea a alguien con fuerza')
        .setId('018', '005')
        .setCooldown(5)
        .ignoreSlash()
        .validForLeveling()
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setRequired(true)
        .setDescription('Menciona a un usuario al que quieras golpear')),
    exec: async () => {
        return;
    },
    message: async (message, args) => {
        execute(message, args);
    }
};
exports.command = command;
async function execute(target, args) {
    let play = new action_1.default(target, {
        args,
        action: 'punch'
    }).set_messages_for_user((author, user) => {
        Action_1.default.setTotalPerAction_ToUser('punch', user?.id);
        let names = {
            for_author: author.globalName || author.username,
            for_user: user.globalName || user.username
        };
        return [
            `**${names.for_author}** golpea a **${names.for_user}**`,
            `**${names.for_author}** ha golpeado a **${names.for_user}**`
        ];
    }).set_bot_can_be_mentioned(false)
        .set_user_required(true);
    (await play.add_user()).execute();
}
