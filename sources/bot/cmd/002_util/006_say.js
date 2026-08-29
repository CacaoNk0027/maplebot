"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../config/config");
const command = {
    data: new command_data_1.default()
        .setName('say')
        .setId('006', '002')
        .setAliases('decir')
        .setDescription('Envía un mensaje a mi nombre')
        .setDescriptionLocalization('en-US', 'Sends a message as me')
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('message')
        .setDescription('El mensaje a enviar')
        .setDescriptionLocalization('en-US', 'The message to send')
        .setMaxLength(2000)
        .setRequired(true))
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('reference')
        .setDescription('ID de un mensaje al cual responder')
        .setDescriptionLocalization('en-US', 'ID of a message to reply to')),
    async exec(interaction) {
        await response(interaction);
    },
    async message(message, args) {
        await response(message, args);
    }
};
exports.command = command;
async function response(caller, args = []) {
    const locale = await (0, config_1._locale)(caller.guild);
    try {
        const content = caller instanceof discord_js_1.ChatInputCommandInteraction
            ? caller.options.getString('message', true)
            : args.join(' ').trim();
        const referenceId = caller instanceof discord_js_1.ChatInputCommandInteraction
            ? caller.options.getString('reference')
            : caller.reference?.messageId ?? null;
        if (!content) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.006.required'), true);
            return;
        }
        if (content.length > 2000) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.006.too_long'), true);
            return;
        }
        const channel = caller.channel;
        if (!channel?.isSendable()) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.002.006.unsupported_channel'), true);
            return;
        }
        if (caller instanceof discord_js_1.Message) {
            try {
                await caller.delete();
            }
            catch (deleteError) {
                if (!isUnknownMessageError(deleteError)) {
                    console.warn('[CommandSay:WARN] No se pudo eliminar el mensaje original:', deleteError);
                }
            }
        }
        if (referenceId) {
            const referencedMessage = await channel.messages.fetch(referenceId);
            await referencedMessage.reply({ content });
        }
        else {
            await channel.send({ content });
        }
        if (caller instanceof discord_js_1.ChatInputCommandInteraction) {
            await (0, config_1.send)(caller, 'ok', (0, config_1.text)(locale, 'cmd.002.006.success'), false);
        }
    }
    catch (error) {
        console.error('[CommandSay:ERR] No se pudo enviar el mensaje:', error);
        await (0, config_1.send)(caller, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
function isUnknownMessageError(error) {
    return typeof error === 'object'
        && error !== null
        && 'code' in error
        && error.code === 10_008;
}
