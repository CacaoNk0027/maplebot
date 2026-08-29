"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpCategories = helpCategories;
exports.helpCategory = helpCategory;
exports.localizedCommandDescription = localizedCommandDescription;
exports.commandList = commandList;
exports.generalHelpFields = generalHelpFields;
exports.specificHelpFields = specificHelpFields;
exports.selectEmoji = selectEmoji;
const menus_json_1 = __importDefault(require("../../shared/bot/assets/json/menus.json"));
const config_1 = require("../config/config");
function helpCategories(locale) {
    return menus_json_1.default.map(category => ({
        id: category.id,
        emoji: category.emoji,
        name: (0, config_1.text)(locale, `cmd.001.002.category.${category.id}.name`),
        description: (0, config_1.text)(locale, `cmd.001.002.category.${category.id}.description`)
    }));
}
function helpCategory(locale, id) {
    return helpCategories(locale).find(category => category.id === id) ?? null;
}
function localizedCommandDescription(command, locale) {
    const normalizedLocale = locale.toLowerCase().startsWith('en') ? 'en-US' : 'es-ES';
    return command.data.description_localizations?.[normalizedLocale] ?? command.data.description;
}
function commandList(locale, prefix, commands, categoryId) {
    const entries = commands
        .filter(command => command.data.category === categoryId)
        .map(command => `${command.data.inactive ? '[🔴]' : '[🟢]'} ${prefix}${command.data.name}`.padEnd(17, ' '));
    if (!entries.length)
        return (0, config_1.text)(locale, 'cmd.001.002.commands.none');
    const rows = [];
    for (let index = 0; index < entries.length; index += 3) {
        rows.push(entries.slice(index, index + 3).join(''));
    }
    return (0, config_1.code_text)(rows.join('\n'));
}
function generalHelpFields(command, locale) {
    const category = helpCategory(locale, command.data.category);
    const aliases = command.data.alias.join(', ') || (0, config_1.text)(locale, 'cmd.001.002.none.aliases');
    const cooldown = command.data.cooldown
        ? (0, config_1.text)(locale, 'cmd.001.002.cooldown.seconds', command.data.cooldown)
        : (0, config_1.text)(locale, 'cmd.001.002.none.cooldown');
    return [{
            name: (0, config_1.text)(locale, 'cmd.001.002.field.aliases'),
            value: (0, config_1.code_text)(aliases)
        }, {
            name: (0, config_1.text)(locale, 'cmd.001.002.field.category'),
            value: (0, config_1.code_text)(category?.name ?? (0, config_1.text)(locale, 'cmd.001.002.none.category')),
            inline: true
        }, {
            name: (0, config_1.text)(locale, 'cmd.001.002.field.nsfw'),
            value: (0, config_1.code_text)(command.data.nsfw
                ? `- ${(0, config_1.text)(locale, 'cmd.001.002.state.enabled')}`
                : `+ ${(0, config_1.text)(locale, 'cmd.001.002.state.disabled')}`, 'diff'),
            inline: true
        }, {
            name: (0, config_1.text)(locale, 'cmd.001.002.field.cooldown'),
            value: (0, config_1.code_text)(cooldown, 'js'),
            inline: true
        }, {
            name: (0, config_1.text)(locale, 'cmd.001.002.field.status'),
            value: (0, config_1.code_text)((0, config_1.text)(locale, command.data.inactive ? 'cmd.001.002.status.inactive' : 'cmd.001.002.status.active'))
        }];
}
function specificHelpFields(command, locale) {
    const normalizedLocale = locale.toLowerCase().startsWith('en') ? 'en-US' : 'es-ES';
    const options = command.data.options.map(option => {
        const data = option.toJSON();
        const description = data.description_localizations?.[normalizedLocale] ?? data.description;
        const required = 'required' in data && Boolean(data.required);
        return `${required ? `<${data.name}>` : `[${data.name}]`} — ${description}`;
    });
    const userPermissions = command.data.user_permissions.length
        ? command.data.user_permissions.join(', ')
        : (0, config_1.text)(locale, 'cmd.001.002.permissions.user.none');
    const botPermissions = command.data.bot_permissions.length
        ? command.data.bot_permissions.join(', ')
        : (0, config_1.text)(locale, 'cmd.001.002.permissions.bot.none');
    return [{
            name: (0, config_1.text)(locale, 'cmd.001.002.field.options'),
            value: (0, config_1.code_text)(options.join('\n') || (0, config_1.text)(locale, 'cmd.001.002.none.options'))
        }, {
            name: (0, config_1.text)(locale, 'cmd.001.002.field.permissions'),
            value: (0, config_1.code_text)(`+ ${(0, config_1.text)(locale, 'cmd.001.002.permissions.user')}\n${userPermissions}\n`
                + `+ ${(0, config_1.text)(locale, 'cmd.001.002.permissions.bot')}\n${botPermissions}`, 'diff')
        }];
}
function selectEmoji(emoji) {
    const customId = emoji.match(/\d+(?=>)/)?.[0];
    return customId
        ? { id: customId }
        : { name: emoji.replace(/<|:[^:]+:|\d+>/g, '') };
}
