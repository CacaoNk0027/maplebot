"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const config_1 = require("../../../bot/config/config");
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
        .setRequired(true)).addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('reference')
        .setDescription('Id de un mensaje a responder')
        .setDescriptionLocalization('en-US', 'The ID of a message to reply to')),
    async exec(interaction) {
        await say(interaction);
    },
    async message(message, args) {
        await say(message, args);
    }
};
exports.command = command;
async function say(target, args) {
    let message;
    let reference = null;
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        message = target.options.getString('message', true);
        reference = target.options.getString('reference');
    }
    else if (target instanceof discord_js_1.Message && args) {
        message = args.join(' ');
    }
    else {
        message = null;
    }
    try {
        if (!message) {
            await (0, config_1.send)(target, 'warn', 'Debes colocar un mensaje para enviar', true).then((reply) => {
                setTimeout(() => {
                    reply.delete();
                }, 5000);
            });
            return;
        }
        if (target instanceof discord_js_1.Message) {
            await target.delete();
            target.reference?.messageId ? (await (await target.channel.messages.fetch(target.reference.messageId)).reply({ content: message })) : await target.channel.send({ content: message });
        }
        else {
            if (!reference) {
                await target.channel.send({ content: message });
                await (0, config_1.send)(target, 'ok', 'Mensaje enviado correctamente.', false);
            }
            else {
                try {
                    await (await target.channel?.messages.fetch(reference))?.reply({ content: message });
                    await (0, config_1.send)(target, 'ok', 'Mensaje enviado correctamente.', false);
                }
                catch (error) {
                    await (0, config_1.send)(target, 'error', 'No se pudo encontrar el mensaje de referencia', true);
                }
            }
        }
    }
    catch (error) {
        await (0, config_1.send)(target, 'error', 'Ocurrió un error al intentar enviar el mensaje, por favor intenta de nuevo', true).then((reply) => {
            setTimeout(() => {
                reply.delete();
            }, 5000);
        });
        return;
    }
}
