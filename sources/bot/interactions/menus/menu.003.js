"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interaction = void 0;
const discord_js_1 = require("discord.js");
const interaction_data_1 = __importDefault(require("../../structs/interaction_data"));
const config_1 = require("../../config/config");
const moderation_1 = require("../../structs/moderation");
const interaction = {
    data: new interaction_data_1.default().setId('menu.003').setUnique(),
    async exec(target) {
        if (!target.isRoleSelectMenu())
            return;
        await target.deferUpdate();
        const locale = await (0, moderation_1.moderationLocale)(target);
        if (!await (0, moderation_1.ensureModerationPermissions)(target, locale, ['ManageRoles'], ['ManageRoles']))
            return;
        const memberId = target.message.embeds[0]?.footer?.text.match(/\d{16,22}/)?.[0];
        const member = memberId
            ? await target.guild?.members.fetch(memberId).catch(() => null)
            : null;
        if (!member) {
            await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'system.003.member.required'), true);
            return;
        }
        if (!await (0, moderation_1.validateTargetMember)(target, member, locale, 'roles'))
            return;
        const roles = target.values
            .map(roleId => target.guild?.roles.cache.get(roleId))
            .filter((role) => Boolean(role));
        if (roles.length !== target.values.length) {
            await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'system.003.role.invalid'), true);
            return;
        }
        for (const role of roles) {
            if (!await (0, moderation_1.validateAssignableRole)(target, role, locale))
                return;
        }
        const rolesToAdd = roles.filter(role => !member.roles.cache.has(role.id));
        if (!rolesToAdd.length) {
            await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.role.already_has'), true);
            return;
        }
        try {
            await member.roles.add(rolesToAdd, `Roles added by ${target.user.tag} (${target.user.id})`);
            const originalEmbed = target.message.embeds[0];
            const embed = new discord_js_1.EmbedBuilder(originalEmbed?.data)
                .setColor(discord_js_1.Colors.Green)
                .setDescription((0, config_1.reply)('ok', (0, config_1.text)(locale, 'cmd.003.001.menu_success', (0, moderation_1.memberDisplayName)(member))))
                .setFields([{
                    name: (0, config_1.text)(locale, 'cmd.003.001.menu_roles'),
                    value: rolesToAdd.map(role => role.toString()).join(' ')
                }]);
            const component = target.component;
            const menu = component instanceof discord_js_1.RoleSelectMenuComponent
                ? discord_js_1.RoleSelectMenuBuilder.from(component).setDisabled(true)
                : new discord_js_1.RoleSelectMenuBuilder()
                    .setCustomId(`menu.003:${target.user.id}`)
                    .setPlaceholder((0, config_1.text)(locale, 'cmd.003.001.select.placeholder'))
                    .setDisabled(true);
            await target.message.edit({
                embeds: [embed],
                components: [{ type: discord_js_1.ComponentType.ActionRow, components: [menu] }]
            });
        }
        catch (error) {
            console.error('[RoleMenu:ERR] No se pudieron añadir los roles:', error);
            await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
        }
    }
};
exports.interaction = interaction;
