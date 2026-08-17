"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interaction = void 0;
const interaction_data_1 = __importDefault(require("../../../bot/structs/interaction_data"));
const discord_js_1 = require("discord.js");
const member_1 = __importDefault(require("../../../bot/structs/member"));
const config_1 = require("../../../bot/config/config");
const interaction = {
    data: new interaction_data_1.default()
        .setId('menu.003')
        .setUnique(),
    async exec(interaction, message) {
        if (!interaction.isRoleSelectMenu())
            return;
        await interaction.deferUpdate();
        let embed = new discord_js_1.EmbedBuilder(message.embeds.shift()?.data);
        let args = embed.data.footer?.text.trim().split(/ +/g);
        let member = await new member_1.default().getInfo(message, args, true);
        let menu = new discord_js_1.RoleSelectMenuBuilder(message.components[0].components[0].data);
        if (!member) {
            await (0, config_1.send)(interaction, 'error', 'No se pudo obtener el usuario, comunicate con el desarrollador', true);
            return;
        }
        const actor = interaction.member;
        const actorCanManageMember = actor.id === interaction.guild?.ownerId
            || actor.roles.highest.comparePositionTo(member.roles.highest) > 0;
        if (!member.manageable || !actorCanManageMember) {
            await (0, config_1.send)(interaction, 'warn', 'No se pueden modificar los roles de este usuario por la jerarquía del servidor.', true);
            return;
        }
        try {
            const roles = interaction.values
                .map(roleId => interaction.guild?.roles.cache.get(roleId))
                .filter((role) => Boolean(role));
            if (roles.length !== interaction.values.length) {
                await (0, config_1.send)(interaction, 'error', 'No se pudieron obtener todos los roles seleccionados. Intenta nuevamente.', true);
                return;
            }
            const invalidRole = roles.find(role => !canAssignRole(actor, role));
            if (invalidRole) {
                await (0, config_1.send)(interaction, 'warn', `No puedes asignar el rol <@&${invalidRole.id}>. Revisa su jerarquía y permisos.`, true);
                return;
            }
            await member.roles.add(roles);
            await message.edit({
                embeds: [
                    embed.setColor(discord_js_1.Colors.Green)
                        .setDescription((0, config_1.reply)('ok', 'Se añadieron correctamente los roles a **' + member.user.username + '**'))
                        .setFields([{
                            name: 'Roles añadidos',
                            value: roles.map(role => `<@&${role.id}>`).join(' ')
                        }])
                ],
                components: [{
                        type: discord_js_1.ComponentType.ActionRow,
                        components: [menu.setDisabled()]
                    }]
            });
        }
        catch (error) {
            console.error(error);
            await (0, config_1.send)(interaction, 'error', 'No se pudieron añadir los roles al usuario especificado', true);
        }
    }
};
exports.interaction = interaction;
function canAssignRole(actor, role) {
    const botMember = role.guild.members.me;
    return role.id !== role.guild.roles.everyone.id
        && !role.managed
        && Boolean(botMember?.permissions.has(discord_js_1.PermissionFlagsBits.ManageRoles))
        && Boolean(botMember && botMember.roles.highest.comparePositionTo(role) > 0)
        && actor.permissions.has(discord_js_1.PermissionFlagsBits.ManageRoles)
        && actor.roles.highest.comparePositionTo(role) > 0;
}
