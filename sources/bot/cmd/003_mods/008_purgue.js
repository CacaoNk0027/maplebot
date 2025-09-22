"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const discord_js_1 = require("discord.js");
const config_1 = require("../../../bot/config/config");
const command = {
    data: new command_data_1.default()
        .setName('purgue')
        .setAliases('pg', 'bulkdelete')
        .setId('008', '003')
        .setDescription('Elimina una cantidad determinada de mensajes')
        .setDescriptionLocalization('en-US', 'Delete one number of messages')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageMessages)
        .setBotPermissions('ManageMessages')
        .setUserPermissions('ManageMessages')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addNumberOption(new discord_js_1.SlashCommandNumberOption()
        .setName('number')
        .setDescription('Numero de mensajes a eliminar')
        .setRequired(true)
        .setMaxValue(100)
        .setMinValue(2)
        .setDescriptionLocalization('en-US', 'Number of messages to delete')),
    async exec(interaction) {
        execute(interaction);
    },
    async message(message, args) {
        execute(message, args);
    }
};
exports.command = command;
async function execute(target, args) {
    let option = 0;
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        option = target.options.getNumber('number', true);
    }
    else if (target instanceof discord_js_1.Message && args && args.length > 0) {
        option = Math.round(parseInt(args[0]));
    }
    else {
        await (0, config_1.send)(target, 'error', 'No haz puesto el numero de mensajes a eliminar', true);
        return;
    }
    if (isNaN(option)) {
        await (0, config_1.send)(target, 'warn', 'No puedes colocar letras ni símbolos', true);
        return;
    }
    if (!(option > 1 && option < 101)) {
        await (0, config_1.send)(target, 'warn', 'El numero debe estar en el rango [2, 100]', true);
        return;
    }
    if (target instanceof discord_js_1.Message) {
        await target.delete().then(async () => {
            await bulkdelete(target, option);
        });
        return;
    }
    await target.deferReply().then(async () => {
        await bulkdelete(target, option);
    });
}
async function bulkdelete(target, number) {
    let total = (await target.channel.bulkDelete(number, true)).size;
    if (total > 0) {
        await target.channel.send({
            embeds: [{
                    color: discord_js_1.Colors.Green,
                    description: (0, config_1.reply)('ok', `Se eliminaron **${total}** mensajes`)
                }]
        });
    }
    else {
        await target.channel.send({
            embeds: [{
                    color: discord_js_1.Colors.Blue,
                    description: (0, config_1.reply)('warn', `No se pudieron eliminar mensajes... son demasiado viejos`)
                }]
        });
    }
}
