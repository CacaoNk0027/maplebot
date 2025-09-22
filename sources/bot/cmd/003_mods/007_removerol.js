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
const role_1 = __importDefault(require("../../../bot/structs/role"));
const command = {
    data: new command_data_1.default()
        .setName('removerol')
        .setAliases('rolremove', 'removerole', 'rrole', 'rrol')
        .setId('007', '003')
        .setDescription('Remueve un rol a un usuario')
        .setDescriptionLocalization('en-US', 'Remove a rol to a user')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageRoles)
        .setBotPermissions('ManageRoles')
        .setUserPermissions('ManageRoles')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('El usuario al que remover el rol')
        .setRequired(true)
        .setDescriptionLocalization('en-US', 'The user to remove the rol')).addRoleOption(new discord_js_1.SlashCommandRoleOption()
        .setName('role')
        .setDescription('El rol a remover')
        .setDescriptionLocalization('en-US', 'The rol to remove')
        .setRequired(true)),
    async exec(interaction) {
        execute(interaction);
    },
    async message(message, args) {
        execute(message, args);
    }
};
exports.command = command;
async function execute(target, args) {
    let member = await new member_1.default().getInfo(target, args);
    if (!member) {
        await (0, config_1.send)(target, 'error', 'No se pudo obtener el usuario, por favor intenta de nuevo', true);
        return;
    }
    if (!await valid_member(target, member))
        return;
    let role = await new role_1.default().getInfo(target, args);
    if (!role) {
        await (0, config_1.send)(target, 'error', 'No se ha podido obtener el rol, por favor intentalo de nuevo');
        return;
    }
    remove_rol(target, member, role);
}
async function valid_member(target, member) {
    if (member.user.bot) {
        await (0, config_1.send)(target, 'warn', 'No puedes remover roles a un bot', true);
        return false;
    }
    if (!member.manageable) {
        await (0, config_1.send)(target, 'warn', 'No puedo remover roles a este usuario', true);
        return false;
    }
    if (member.id == target.member.id) {
        await (0, config_1.send)(target, 'warn', 'No puedes removerte roles a ti mismo', true);
        return false;
    }
    if (member.id == target.guild?.ownerId) {
        await (0, config_1.send)(target, 'warn', 'No puedes remover roles al dueño del servidor', true);
        return false;
    }
    if (member.id == target.client.user?.id) {
        await (0, config_1.send)(target, 'warn', 'No puedes removerme roles', true);
        return false;
    }
    return true;
}
async function remove_rol(target, member, role) {
    if (!await validate_rol(target, member, role))
        return;
    if (!member.roles.cache.has(role.id)) {
        await (0, config_1.send)(target, 'warn', 'El usuario no cuenta con el rol especificado', true);
        return;
    }
    try {
        await member.roles.remove(role);
        await target.reply({
            embeds: [{
                    description: (0, config_1.reply)('ok', `Se removio un rol a **${member.nickname || member.user.globalName || member.user.username}**`),
                    color: discord_js_1.Colors.Green,
                    fields: [{
                            name: '🔰 | Rol',
                            value: `<@&${role.id}>`
                        }]
                }]
        });
    }
    catch (error) {
        await (0, config_1.send)(target, 'error', 'no se pudo añadir el rol, por favor intentalo de nuevo', true);
    }
}
async function validate_rol(target, member, role) {
    if (role == target.guild?.roles.everyone || role.name == '@here') {
        await (0, config_1.send)(target, 'warn', 'Los roles everyone y here no son validos para remover', true);
        return false;
    }
    if (!role.editable ||
        !target.guild?.members.me ||
        !target.guild.members.me.roles.highest ||
        target.guild.members.me.roles.highest.comparePositionTo(role) <= 0) {
        await (0, config_1.send)(target, 'warn', 'No puedo acceder a ese rol, por lo que no puedo removerlo a alguien más', true);
        return false;
    }
    if ((target.member?.roles).highest.comparePositionTo(role) <= 0) {
        await (0, config_1.send)(target, 'warn', 'No puedes remover un rol de mayor jerarquía al tuyo', true);
        return false;
    }
    if ((target.member?.roles).highest.comparePositionTo(member.roles.highest) <= 0) {
        await (0, config_1.send)(target, 'warn', "el usuario mencionado tiene un rol de mayor o igual jerarquia al tuyo", true);
        return false;
    }
    return true;
}
