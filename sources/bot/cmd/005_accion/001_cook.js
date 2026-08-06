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
        .setName('cook')
        .setDescription('Ponte la bata y cocina algo')
        .setAliases('cocinar')
        .setId('001', '005')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .ignoreSlash()
        .validForLeveling()
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('Menciona a un usuario para cocinarle algo')),
    exec: async (interaction) => {
        return;
    },
    message: async (message, args) => {
        await execute(message, args);
    }
};
exports.command = command;
async function execute(target, args) {
    const cook = new action_1.default(target, {
        args,
        action: 'cook'
    }).set_messages_for_author((author) => {
        let name = author.globalName || author.username;
        return [
            `**${name}** se ha puesto la bata y ha cocinado algo delicioso`,
            `**${name}** ha preparado una comida exquisita`,
            `**${name}** esta haciendo un plato espectacular`,
            `**${name}** ha hecho una receta increíble`,
            `**${name}** se ha puesto el delantal y ha cocinado`
        ];
    }).set_messages_for_user((author, user) => {
        let names = {
            for_user: user.globalName || user.username,
            author: author.globalName || author.username
        };
        return [
            `**${names.author}** se ha puesto la bata y cocina para **${names.for_user}**`,
            `**${names.author}** ha preparado una comida exquisita para **${names.for_user}**`,
            `**${names.author}** le esta haciendo un plato espectacular a **${names.for_user}**`,
            `**${names.author}** le cocina una receta increíble a **${names.for_user}**`,
            `**${names.author}** se ha puesto el delantal y ha cocinado para **${names.for_user}**`
        ];
    }).set_bot_can_be_mentioned(true)
        .set_messages_for_bot(() => [(0, config_1.reply)('ok', 'Te haré algo de comer con mucho amor')]);
    await (await cook.add_user()).execute();
}
