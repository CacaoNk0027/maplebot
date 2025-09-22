"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const discord_js_1 = require("discord.js");
const member_1 = __importDefault(require("../../../bot/structs/member"));
const config_1 = require("../../../bot/config/config");
const command = {
    data: new command_data_1.default()
        .setName('unmute')
        .setAliases('utmo', 'untimeout', 'untmo')
        .setId('005', '003')
        .setDescription('Elimina un aislamiento temporal a un usuario')
        .setDescriptionLocalization('en-US', 'Remove a temporary mute to a user')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ModerateMembers)
        .setBotPermissions('ModerateMembers')
        .setUserPermissions('ModerateMembers')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('Usuario a remover el aislamiento')
        .setDescriptionLocalization('en-US', 'User to remove the mute')
        .setRequired(true)).addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('reason')
        .setDescription('Razón de la acción')
        .setDescriptionLocalization('en-US', 'Reason for the action')),
    async exec(interaction) {
        await removeMute(interaction);
    },
    async message(message, args) {
        removeMute(message, args);
    }
};
exports.command = command;
async function removeMute(target, args) {
    let member = await (await new member_1.default().getInfo(target, args))?.fetch();
    let reason = target instanceof discord_js_1.Message ? args?.slice(1).join(' ') || 'No especificada' : target.options.getString('reason') || 'No especificada';
    if (!member) {
        await (0, config_1.send)(target, 'error', 'No se encontró al usuario, por favor intenta de nuevo', true);
        return;
    }
    if (!valid_member(target, member))
        return;
    try {
        await member.timeout(null, `Aislamiento removido por ${target.member?.user.username || 'un moderador'}\nRazón: ${reason}`);
    }
    catch (error) {
        await (0, config_1.send)(target, 'error', 'No se pudo remover el aislamiento, por favor intenta de nuevo', true);
    }
    await target.reply({
        embeds: [{
                color: discord_js_1.Colors.Green,
                description: (0, config_1.reply)('ok', `El aislamiento a **${member.nickname || member.user.globalName || member.user.username}** fue removido correctamente`)
            }]
    });
}
async function valid_member(target, member) {
    if (member.user.bot) {
        await (0, config_1.send)(target, 'warn', 'No puedes quitar un aislamiento a un bot', true);
        return false;
    }
    if (!member.manageable) {
        await (0, config_1.send)(target, 'warn', 'No puedo quitar aislamiento a este usuario', true);
        return false;
    }
    if (member.id == target.member.id) {
        await (0, config_1.send)(target, 'warn', 'No puedes quitarte un aislamiento', true);
        return false;
    }
    if (member.id == target.guild?.ownerId) {
        await (0, config_1.send)(target, 'warn', 'No puedes quitar aislamiento al dueño del servidor', true);
        return false;
    }
    if (member.id == target.client.user?.id) {
        await (0, config_1.send)(target, 'warn', 'No puedes quitarme aislamiento', true);
        return false;
    }
    return true;
}
