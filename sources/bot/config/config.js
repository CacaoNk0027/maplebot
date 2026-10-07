"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.branch = exports.theme_color = void 0;
exports.is_allowed_id = is_allowed_id;
exports.code_text = code_text;
exports.random_color = random_color;
exports.commands_menu = commands_menu;
exports.por_barra = por_barra;
exports.user_flags = user_flags;
exports.send = send;
exports.reply = reply;
exports.rand = rand;
exports.rp_embed = rp_embed;
exports.text = text;
exports._locale = _locale;
exports.verificacion = verificacion;
const discord_js_1 = require("discord.js");
const es_ES_json_1 = __importDefault(require("../../shared/bot/locales/es-ES.json"));
const en_US_json_1 = __importDefault(require("../../shared/bot/locales/en-US.json"));
const Guild_1 = __importDefault(require("../../shared/bot/models/Guild"));
const emojis_1 = require("../../shared/config/emojis");
const locales = {
    'es-ES': es_ES_json_1.default,
    'en-US': en_US_json_1.default
};
let managers = [
    "801603753631285308"
];
exports.theme_color = 0xfcbc6d;
exports.branch = "sources/bot";
function is_allowed_id(id) {
    return managers.includes(id);
}
function code_text(text, format) {
    return '```' + (format ?? '') + '\n' + text + '\n```';
}
function random_color() {
    let array = Object.entries(discord_js_1.Colors).map(([_, num]) => num);
    return rand(array);
}
function commands_menu(prefix, commands, category) {
    let filtered = commands.filter(command => command.data.category == category);
    let fo_commands = filtered.map((c) => ((c.data.inactive ? '[🔴] ' : '[🟢] ') + prefix + c.data.name).padEnd(20, ' '));
    let groups = [], i, finalText;
    for (i = 0; i < fo_commands.length; i += 3) {
        groups.push(fo_commands.slice(i, i + 3).join(''));
    }
    finalText = groups.join('\n');
    return code_text(finalText);
}
function por_barra(porcentaje, longitud = 10) {
    let llenos = Math.round((porcentaje / 100) * longitud);
    let vacios = longitud - llenos;
    return '█'.repeat(llenos) + '_'.repeat(vacios);
}
function user_flags(user) {
    let flags = {
        Staff: emojis_1.EMOJI.staff,
        Partner: emojis_1.EMOJI.partner,
        Hypesquad: emojis_1.EMOJI.hypesquad,
        BugHunterLevel1: emojis_1.EMOJI.bughunter1,
        HypeSquadOnlineHouse1: emojis_1.EMOJI.bravery,
        HypeSquadOnlineHouse2: emojis_1.EMOJI.brilliance,
        HypeSquadOnlineHouse3: emojis_1.EMOJI.balance,
        PremiumEarlySupporter: emojis_1.EMOJI.earlynitro,
        BugHunterLevel2: emojis_1.EMOJI.bughunter2,
        VerifiedDeveloper: emojis_1.EMOJI.earlydev,
        CertifiedModerator: emojis_1.EMOJI.moderator
    };
    let available = user.flags?.toArray() || [];
    let badges = available?.length > 0
        ? available
            .filter((flag) => flag in flags)
            .map(flag => flags[flag])
            .join(' ')
        : 'Sin insignias';
    return badges;
}
async function send(target, type, content, is_embed) {
    let color = {
        'ok': discord_js_1.Colors.Green,
        'info': discord_js_1.Colors.Blue,
        'warn': discord_js_1.Colors.Yellow,
        'error': discord_js_1.Colors.Red
    };
    if (!(target instanceof discord_js_1.Message)) {
        const payload = is_embed ? {
            embeds: [{
                    color: color[type],
                    description: reply(type, content)
                }],
            flags: ['Ephemeral']
        } : {
            content,
            flags: ['Ephemeral']
        };
        if (target.deferred) {
            if (target.isMessageComponent()) {
                return await target.followUp(payload);
            }
            const { flags, ...editPayload } = payload;
            return await target.editReply(editPayload);
        }
        if (target.replied) {
            return await target.followUp(payload);
        }
        return await target.reply(payload);
    }
    else {
        return is_embed ? await target.reply({
            embeds: [{
                    color: color[type],
                    description: reply(type, content)
                }],
        }) : await target.reply({
            content
        });
    }
}
function reply(msg_type, description) {
    let message;
    switch (msg_type) {
        case 'info':
            message = `> ${rand([
                emojis_1.EMOJI.okay,
                emojis_1.EMOJI.tea
            ])} | ${description}`;
            break;
        case 'warn':
            message = `> ${rand([
                emojis_1.EMOJI.angry,
                emojis_1.EMOJI.idk
            ])} | ${description}`;
            break;
        case 'error':
            message = `> ${rand([
                emojis_1.EMOJI.fall,
                emojis_1.EMOJI.confused,
                emojis_1.EMOJI.surprise,
            ])} | ${description}`;
            break;
        case "ok":
            message = `> ${rand([
                emojis_1.EMOJI.kiss,
                emojis_1.EMOJI.wink,
                emojis_1.EMOJI.tea
            ])} | ${description}`;
            break;
        default: message = description;
    }
    return message;
}
function rand(list) {
    return list[Math.floor(Math.random() * list.length)];
}
async function rp_embed(target, message, gif, locale = 'es-ES', customFooter, systemPrefix = '005') {
    let image = gif.getUrl() || '';
    await target.reply({
        embeds: [{
                description: message,
                image: { url: image },
                color: random_color(),
                footer: {
                    text: customFooter ?? text(locale, `system.${systemPrefix}.embed.source`, gif.getAnime() || text(locale, `system.${systemPrefix}.embed.unknown`))
                }
            }]
    });
}
function text(lang, id, ...args) {
    const locale = lang?.toLowerCase().startsWith('en') ? 'en-US' : 'es-ES';
    const template = locales[locale][id] ?? locales['es-ES'][id] ?? id;
    let argIndex = 0;
    return template.replace(/%%|%[ds]/g, placeholder => {
        if (placeholder === '%%')
            return '%';
        if (argIndex >= args.length)
            return placeholder;
        const value = args[argIndex++];
        if (placeholder === '%d') {
            const number = Number(value);
            return Number.isFinite(number) ? String(number) : String(value);
        }
        return String(value);
    });
}
async function _locale(guild) {
    if (!guild)
        return 'es-ES';
    return guild.id ? await Guild_1.default.getLanguage(guild.id) ?? guild?.preferredLocale : 'es-ES';
}
function verificacion(level, locale) {
    return text(locale, `config.verif.${level}`);
}
