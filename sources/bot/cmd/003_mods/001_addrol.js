"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../config/config");
const moderation_1 = require("../../structs/moderation");
const command = {
    data: new command_data_1.default()
        .setName('addrol')
        .setAliases('roladd', 'addrole', 'arol', 'arole', 'agregarrol', 'anadirrol')
        .setId('001', '003')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.001.description'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.001.description'))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageRoles)
        .setBotPermissions('ManageRoles')
        .setUserPermissions('ManageRoles')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addUserOption(new discord_js_1.SlashCommandUserOption()
        .setName('user')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.001.user_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.001.user_option'))
        .setRequired(true))
        .addRoleOption(new discord_js_1.SlashCommandRoleOption()
        .setName('role')
        .setDescription((0, config_1.text)('es-ES', 'cmd.003.001.role_option'))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'cmd.003.001.role_option'))),
    async exec(interaction) {
        await response(interaction);
    },
    async message(message, args) {
        await response(message, args);
    }
};
exports.command = command;
async function response(target, args = []) {
    const locale = await (0, moderation_1.moderationLocale)(target);
    if (!await (0, moderation_1.ensureModerationPermissions)(target, locale, ['ManageRoles'], ['ManageRoles']))
        return;
    const resolved = await (0, moderation_1.resolveGuildMember)(target, args);
    if (!resolved) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.member.required'), true);
        return;
    }
    if (!await (0, moderation_1.validateTargetMember)(target, resolved.member, locale, 'roles'))
        return;
    const role = await (0, moderation_1.resolveGuildRole)(target, args, resolved.consumedArgument === null ? [resolved.member.id] : []);
    if (!role) {
        await showRoleMenu(target, resolved.member.id, locale);
        return;
    }
    if (!await (0, moderation_1.validateAssignableRole)(target, role, locale))
        return;
    if (resolved.member.roles.cache.has(role.id)) {
        await (0, config_1.send)(target, 'warn', (0, config_1.text)(locale, 'system.003.role.already_has'), true);
        return;
    }
    try {
        const actor = target instanceof discord_js_1.Message ? target.author : target.user;
        await resolved.member.roles.add(role, `Role added by ${actor.tag} (${actor.id})`);
        await target.reply({
            embeds: [{
                    color: discord_js_1.Colors.Green,
                    description: (0, config_1.reply)('ok', (0, config_1.text)(locale, 'cmd.003.001.success', (0, moderation_1.memberDisplayName)(resolved.member))),
                    fields: [{ name: (0, config_1.text)(locale, 'system.003.role.field'), value: role.toString() }]
                }]
        });
    }
    catch (error) {
        console.error('[CommandAddRole:ERR] No se pudo añadir el rol:', error);
        await (0, config_1.send)(target, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
async function showRoleMenu(target, memberId, locale) {
    const actorId = target instanceof discord_js_1.Message ? target.author.id : target.user.id;
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle((0, config_1.text)(locale, 'cmd.003.001.select.title'))
        .setDescription((0, config_1.reply)('info', (0, config_1.text)(locale, 'cmd.003.001.select.description')))
        .setColor((0, config_1.random_color)())
        .setFooter({ text: `UserId: ${memberId}` });
    const menu = new discord_js_1.RoleSelectMenuBuilder()
        .setCustomId(`menu.003:${actorId}`)
        .setMinValues(1)
        .setMaxValues(10)
        .setPlaceholder((0, config_1.text)(locale, 'cmd.003.001.select.placeholder'));
    await target.reply({
        embeds: [embed],
        components: [{ type: discord_js_1.ComponentType.ActionRow, components: [menu] }]
    });
}
