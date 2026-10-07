"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../config/config");
const warn_1 = require("../../structs/warn");
const REMOVE_WORDS = ['remove', 'retirar', 'quitar', 'unwarn'];
const ADD_WORDS = ['add', 'aplicar'];
const command = {
    data: new command_data_1.default()
        .setName('warn')
        .setAliases('advertir', 'avisar', 'advertencia')
        .setId('013', '003')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.013.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.013.description'))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ModerateMembers)
        .setUserPermissions('ModerateMembers')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('add')
        .setNameLocalization('es-ES', 'aplicar')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.013.add.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.013.add.description'))
        .addUserOption(userOption())
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('reason')
        .setNameLocalization('es-ES', 'razon')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.013.reason_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.013.reason_option'))))
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('remove')
        .setNameLocalization('es-ES', 'retirar')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.013.remove.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.013.remove.description'))
        .addUserOption(userOption())),
    async exec(interaction) {
        await response(interaction);
    },
    async message(message, args) {
        await response(message, args);
    }
};
exports.command = command;
function userOption() {
    return new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setNameLocalization('es-ES', 'usuario')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.013.user_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.013.user_option'))
        .setRequired(true);
}
async function response(target, args = []) {
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        if (target.options.getSubcommand() === 'remove')
            await (0, warn_1.removeLastWarning)(target);
        else
            await (0, warn_1.warnMember)(target);
        return;
    }
    // Por prefijo la operación es opcional: `warn @usuario motivo` avisa y
    // `warn retirar @usuario` retira. Solo se consume el argumento si la nombra.
    const first = args[0]?.toLocaleLowerCase();
    if (first && REMOVE_WORDS.includes(first)) {
        await (0, warn_1.removeLastWarning)(target, args.slice(1));
        return;
    }
    await (0, warn_1.warnMember)(target, first && ADD_WORDS.includes(first) ? args.slice(1) : args);
}
