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
const ms_1 = __importDefault(require("ms"));
const command = {
    data: new command_data_1.default()
        .setName('mute')
        .setAliases('muteo', 'tmo', 'timeout')
        .setId('004', '003')
        .setDescription('Aplica un aislamiento temporal a un usuario')
        .setDescriptionLocalization('en-US', 'Applies a temporary mute to a user')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ModerateMembers)
        .setBotPermissions('ModerateMembers')
        .setUserPermissions('ModerateMembers')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('Usuario para aislar')
        .setDescriptionLocalization('en-US', 'User to mute')
        .setRequired(true)).addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('time')
        .setDescription('Duración del aislamiento bajo formato [2h, 30m, 1w]. Max: 28d')
        .setDescriptionLocalization('en-US', 'Duration of the mute in format [2h, 30m, 1w]. Max: 28d')).addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('reason')
        .setDescription('Razón del aislamiento')
        .setDescriptionLocalization('en-US', 'Reason for the mute')),
    async exec(interaction) {
        await interaction.deferReply();
        await addMute(interaction);
    },
    async message(message, args) {
        await addMute(message, args);
    }
};
exports.command = command;
async function addMute(target, args) {
    let member = await (await new member_1.default().getInfo(target, args))?.fetch();
    if (!member) {
        await (0, config_1.send)(target, 'error', 'No se encontró al usuario, por favor intenta de nuevo', true);
        return;
    }
    if (!valid_member(target, member))
        return;
    let time;
    let reason;
    if (target instanceof discord_js_1.Message) {
        if (!args || args.length < 1) {
            await (0, config_1.send)(target, 'error', 'Debes mencionar a un usuario', true);
            return;
        }
        let remainingArgs = args.slice(1);
        if (remainingArgs.length === 0) {
            time = (0, ms_1.default)('10m');
            reason = 'No especificada';
        }
        else {
            let potentialTime = remainingArgs[0];
            let parsedTime = getTime(potentialTime);
            if (parsedTime === (0, ms_1.default)('10m') && potentialTime !== '10m') {
                time = (0, ms_1.default)('10m');
                reason = remainingArgs.join(' ') || 'No especificada';
            }
            else {
                time = parsedTime;
                reason = remainingArgs.slice(1).join(' ') || 'No especificada';
            }
        }
    }
    else {
        time = getTime(target.options.getString('time') || '10m');
        reason = target.options.getString('reason') || 'No especificada';
    }
    try {
        await member.timeout(time, `Aislamiento aplicado por ${target.member?.user.username || 'un moderador'}\nRazón: ${reason}`);
    }
    catch (error) {
        await (0, config_1.send)(target, 'error', 'No se pudo aplicar el aislamiento, por favor intenta de nuevo', true);
        return;
    }
    const response = {
        embeds: [{
                color: discord_js_1.Colors.Green,
                description: (0, config_1.reply)('info', `**${member.nickname || member.user.globalName || member.user.username}** fue aislado correctamente`)
            }]
    };
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        await target.editReply(response);
    }
    else {
        await target.reply(response);
    }
}
function getTime(value) {
    if (!value)
        return (0, ms_1.default)('10m');
    try {
        let time = (0, ms_1.default)(value);
        if (time < (0, ms_1.default)('60s')) {
            time = (0, ms_1.default)('60s');
        }
        if (time > (0, ms_1.default)('28d')) {
            time = (0, ms_1.default)('28d');
        }
        return time || (0, ms_1.default)('10m');
    }
    catch (error) {
        return (0, ms_1.default)('10m');
    }
}
async function valid_member(target, member) {
    if (member.user.bot) {
        await (0, config_1.send)(target, 'warn', 'No puedes aislar a un bot', true);
        return false;
    }
    if (!member.manageable) {
        await (0, config_1.send)(target, 'warn', 'No puedo aislar a este usuario', true);
        return false;
    }
    if (member.id == target.member.id) {
        await (0, config_1.send)(target, 'warn', 'No puedes aislarte', true);
        return false;
    }
    if (member.id == target.guild?.ownerId) {
        await (0, config_1.send)(target, 'warn', 'No puedes aislar al dueño del servidor', true);
        return false;
    }
    if (member.id == target.client.user?.id) {
        await (0, config_1.send)(target, 'warn', 'No puedes aislarme', true);
        return false;
    }
    return true;
}
