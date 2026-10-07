"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const role_1 = __importDefault(require("../../structs/role"));
const config_1 = require("../../config/config");
const command = {
    data: new command_data_1.default()
        .setName('roleinfo')
        .setId('007', '001')
        .setAliases('role', 'rolinfo', 'rol')
        .setDescription('Muestra la información de un rol')
        .setDescriptionLocalization('en-US', 'Shows the information of a role')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addRoleOption(new discord_js_1.SlashCommandRoleOption()
        .setName('role')
        .setDescription('El rol del que quieres ver la información')
        .setDescriptionLocalization('en-US', 'The role you want to see the information of')
        .setRequired(true)),
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
        if (!caller.guild) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.001.007.guild_only'), true);
            return;
        }
        const role = await new role_1.default().getInfo(caller, args);
        if (!role) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.001.007.not_found'), true);
            return;
        }
        const si = (0, config_1.text)(locale, 'cmd.001.007.yes');
        const no = (0, config_1.text)(locale, 'cmd.001.007.no');
        const propiedades = [
            `${role.hoist ? si : no} ${(0, config_1.text)(locale, 'cmd.001.007.property.hoist')}`,
            `${role.mentionable ? si : no} ${(0, config_1.text)(locale, 'cmd.001.007.property.mentionable')}`,
            `${role.managed ? si : no} ${(0, config_1.text)(locale, 'cmd.001.007.property.managed')}`
        ].join('\n');
        const permisos = role.permissions.toArray();
        const listaPermisos = permisos.length
            ? permisos.join(', ')
            : (0, config_1.text)(locale, 'cmd.001.007.permissions.none');
        // Un rol puede llevar hasta tres colores: Discord admite degradados.
        const hexOf = (value) => `#${value.toString(16).padStart(6, '0').toUpperCase()}`;
        const { primaryColor, secondaryColor, tertiaryColor } = role.colors;
        const colores = [primaryColor, secondaryColor, tertiaryColor]
            .filter((value) => typeof value === 'number' && value !== 0)
            .map(hexOf);
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle((0, config_1.text)(locale, 'cmd.001.007.title', role.name))
            .setColor(primaryColor || (0, config_1.random_color)())
            .setFields([{
                name: '🆔 | ID',
                value: (0, config_1.code_text)(role.id),
                inline: true
            }, {
                name: `🎨 | ${(0, config_1.text)(locale, 'cmd.001.007.field.color')}`,
                value: (0, config_1.code_text)(colores.join(' → ') || (0, config_1.text)(locale, 'cmd.001.007.color.none')),
                inline: true
            }, {
                name: `👥 | ${(0, config_1.text)(locale, 'cmd.001.007.field.members')}`,
                value: (0, config_1.code_text)(String(role.members.size)),
                inline: true
            }, {
                name: `📊 | ${(0, config_1.text)(locale, 'cmd.001.007.field.position')}`,
                value: (0, config_1.code_text)(String(role.position)),
                inline: true
            }, {
                name: `📍 | ${(0, config_1.text)(locale, 'cmd.001.007.field.mention')}`,
                value: (0, config_1.code_text)(`<@&${role.id}>`),
                inline: true
            }, {
                name: `🕑 | ${(0, config_1.text)(locale, 'cmd.001.007.field.created')}`,
                value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`,
                inline: true
            }, {
                name: `⚙️ | ${(0, config_1.text)(locale, 'cmd.001.007.field.properties')}`,
                value: propiedades
            }, {
                // Un rol con muchos permisos puede pasarse del límite de Discord.
                name: `🔐 | ${(0, config_1.text)(locale, 'cmd.001.007.field.permissions', permisos.length)}`,
                value: (0, config_1.code_text)(listaPermisos.slice(0, 1000))
            }]);
        const icono = role.iconURL({ size: 256 });
        if (icono)
            embed.setThumbnail(icono);
        await caller.reply({ embeds: [embed] });
    }
    catch (error) {
        console.error('[CommandRoleInfo:ERR] No se pudo mostrar el rol:', error);
        await (0, config_1.send)(caller, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
