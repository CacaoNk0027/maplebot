"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const member_1 = __importDefault(require("../../../bot/structs/member"));
const discord_js_1 = require("discord.js");
const config_1 = require("../../../bot/config/config");
const Rolelist_1 = __importDefault(require("../../../shared/bot/models/Rolelist"));
const role_1 = __importDefault(require("../../../bot/structs/role"));
const command = {
    data: new command_data_1.default()
        .setName('addrol')
        .setAliases('roladd', 'addrole', 'arol', 'arole')
        .setId('001', '003')
        .setDescription('Añade un rol a un usuario')
        .setDescriptionLocalization('en-US', 'Add one rol to a user')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageRoles)
        .setBotPermissions('ManageRoles')
        .setUserPermissions('ManageRoles')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription('El usuario al que añadir el rol')
        .setRequired(true)
        .setDescriptionLocalization('en-US', 'The user to add the rol')).addRoleOption(new discord_js_1.SlashCommandRoleOption()
        .setName('role')
        .setDescription('El rol a añadir al usuario')
        .setDescriptionLocalization('en-US', 'The rol to add to the user')),
    async exec(interaction) {
        await execute(interaction);
    },
    async message(message, args) {
        await execute(message, args);
    }
};
exports.command = command;
async function execute(target, args) {
    let member = null;
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        member = await new member_1.default().getInfo(target);
    }
    else if (target instanceof discord_js_1.Message && args) {
        if (!args[0] || args?.length < 1) {
            await (0, config_1.send)(target, 'warn', 'Debes mencionar a un usuario o proporcionar un ID.', true);
            return;
        }
        member = await new member_1.default().getInfo(target, args);
    }
    if (!member) {
        await (0, config_1.send)(target, 'error', 'No se pudo obtener el usuario, por favor intenta de nuevo', true);
        return;
    }
    if (!await valid_member(target, member)) {
        return;
    }
    await add_roles(target, member, args);
}
async function valid_member(target, member) {
    if (member.user.bot) {
        await (0, config_1.send)(target, 'warn', 'No puedes añadir roles a un bot', true);
        return false;
    }
    if (!member.manageable) {
        await (0, config_1.send)(target, 'warn', 'No puedo añadir roles a este usuario', true);
        return false;
    }
    if (member.id == target.member.id) {
        await (0, config_1.send)(target, 'warn', 'No puedes añadir roles a ti mismo', true);
        return false;
    }
    if (member.id == target.guild?.ownerId) {
        await (0, config_1.send)(target, 'warn', 'No puedes añadir roles al dueño del servidor', true);
        return false;
    }
    if (member.id == target.client.user?.id) {
        await (0, config_1.send)(target, 'warn', 'No puedes añadirme roles', true);
        return false;
    }
    return true;
}
async function add_roles(target, member, args) {
    let role = await new role_1.default().getInfo(target, args);
    if (role) {
        add_rol(target, member, role);
        return;
    }
    let default_roles = (await Rolelist_1.default.getByGuildId(target.guildId) || []);
    let embed = new discord_js_1.EmbedBuilder({
        title: '🔰 | Añade roles',
        description: (0, config_1.reply)('info', 'Selecciona roles de la lista para añadir'),
        color: (0, config_1.random_color)(),
        footer: {
            text: `UserId: ${member.user.id}`
        }
    });
    let select_menu = new discord_js_1.RoleSelectMenuBuilder({
        custom_id: 'menu.003',
        max_values: 10,
        min_values: 1,
        type: discord_js_1.ComponentType.RoleSelect,
        placeholder: 'Selecciona los roles a añadir'
    });
    if (default_roles.length >= 1) {
        select_menu.addDefaultRoles(default_roles);
    }
    await target.reply({
        components: [{
                type: discord_js_1.ComponentType.ActionRow,
                components: [select_menu]
            }],
        embeds: [embed]
    });
}
async function add_rol(target, member, role) {
    if (!await validate_rol(target, member, role))
        return;
    try {
        await member.roles.add(role);
        await Rolelist_1.default.addRole(target.guildId, role.id);
        await target.reply({
            embeds: [{
                    description: (0, config_1.reply)('ok', `Se añadio un rol a **${member.nickname || member.user.globalName || member.user.username}**`),
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
        await (0, config_1.send)(target, 'warn', 'Los roles everyone y here no son validos para añadir', true);
        return false;
    }
    if (!role.editable ||
        !target.guild?.members.me ||
        !target.guild.members.me.roles.highest ||
        target.guild.members.me.roles.highest.comparePositionTo(role) <= 0) {
        await (0, config_1.send)(target, 'warn', 'No puedo acceder a ese rol, por lo que no puedo agregarlo a alguien más', true);
        return false;
    }
    if ((target.member?.roles).highest.comparePositionTo(role) <= 0) {
        await (0, config_1.send)(target, 'warn', 'No puedes añadir un rol de mayor jerarquía al tuyo', true);
        return false;
    }
    if ((target.member?.roles).highest.comparePositionTo(member.roles.highest) <= 0) {
        await (0, config_1.send)(target, 'warn', "el usuario mencionado tiene un rol de mayor o igual jerarquia al tuyo", true);
        return false;
    }
    return true;
}
