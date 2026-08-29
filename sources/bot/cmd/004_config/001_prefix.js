"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const Guild_1 = __importDefault(require("../../../shared/bot/models/Guild"));
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../config/config");
const DEFAULT_PREFIX = 'm!';
const command = {
    data: new command_data_1.default()
        .setName('prefix')
        .setDescription('Consulta o establece el prefijo del bot')
        .setDescriptionLocalization('en-US', 'View or set the bot prefix')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageGuild)
        .setAliases('px', 'prefijo')
        .setUserPermissions('ManageGuild')
        .setId('001', '004')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('new-prefix')
        .setDescription('Nuevo prefijo; usa m! para restablecerlo')
        .setDescriptionLocalization('en-US', 'New prefix; use m! to reset it')
        .setMinLength(1)
        .setMaxLength(4)),
    async exec(interaction) {
        await response(interaction, interaction.options.getString('new-prefix'));
    },
    async message(message, args) {
        await response(message, args[0]);
    }
};
exports.command = command;
async function response(caller, requestedPrefix) {
    const locale = await (0, config_1._locale)(caller.guild);
    try {
        if (!caller.guildId || !caller.guild) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'system.004.guild_only'), true);
            return;
        }
        const storedPrefix = await Guild_1.default.getPrefix(caller.guildId);
        const currentPrefix = storedPrefix ?? DEFAULT_PREFIX;
        if (!requestedPrefix) {
            await caller.reply({
                embeds: [{
                        author: {
                            name: caller.guild.name,
                            icon_url: caller.guild.iconURL({ forceStatic: false }) ?? undefined
                        },
                        title: (0, config_1.text)(locale, 'cmd.004.001.title', currentPrefix),
                        description: (0, config_1.text)(locale, 'cmd.004.001.current', currentPrefix),
                        fields: [{
                                name: (0, config_1.text)(locale, 'cmd.004.001.change'),
                                value: (0, config_1.code_text)(`${currentPrefix}prefix <prefix>`)
                            }],
                        color: config_1.theme_color
                    }]
            });
            return;
        }
        const newPrefix = requestedPrefix.trim();
        if (!newPrefix || newPrefix.length > 4 || /\s/.test(newPrefix) || /^<@!?\d+>$/.test(newPrefix)) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.004.001.invalid'), true);
            return;
        }
        const reset = newPrefix.toLowerCase() === DEFAULT_PREFIX;
        const valueToStore = reset ? '' : newPrefix;
        if ((reset && !storedPrefix) || newPrefix === storedPrefix) {
            await (0, config_1.send)(caller, 'warn', (0, config_1.text)(locale, 'cmd.004.001.unchanged', currentPrefix), true);
            return;
        }
        await Guild_1.default.setPrefix(caller.guildId, valueToStore);
        await (0, config_1.send)(caller, 'ok', reset
            ? (0, config_1.text)(locale, 'cmd.004.001.reset', DEFAULT_PREFIX)
            : (0, config_1.text)(locale, 'cmd.004.001.success', newPrefix), true);
    }
    catch (error) {
        console.error('[CommandPrefix:ERR] No se pudo consultar o cambiar el prefijo:', error);
        await (0, config_1.send)(caller, 'error', (0, config_1.text)(locale, 'reply.error'), true);
    }
}
