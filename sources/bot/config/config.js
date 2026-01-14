"use strict";
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
const discord_js_1 = require("discord.js");
let managers = [
    "801603753631285308"
];
exports.theme_color = 0xfcbc6d;
exports.branch = "sources/bot";
function is_allowed_id(id) {
    return managers.includes(id);
}
function code_text(text, format) {
    return '```' + format + '\n' + text + '\n```';
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
        Staff: '<:staff:1262144147687477310>',
        Partner: '<:partner:1262143727669874761>',
        Hypesquad: '<:hypesquad:1262143722502754394>',
        BugHunterLevel1: '<:bugHunter:1262143731235164222>',
        HypeSquadOnlineHouse1: '<:bravery:1262144150632005763>',
        HypeSquadOnlineHouse2: '<:brilliance:1262143738151702569>',
        HypeSquadOnlineHouse3: '<:balance:1262143741645553684>',
        PremiumEarlySupporter: '<:earlysuporter:1262143724524404838>',
        BugHunterLevel2: '<:goldBugHunter:1262144148371406961>',
        VerifiedDeveloper: '<:verifiedDeveloper:1262143723542675488>',
        CertifiedModerator: '<:moderatorprograms:1262143721105920121>',
        ActiveDeveloper: '<:activeDeveloper:1262144149537423464>',
        VerifiedBot: '<:verifiedBot:1407070653840101458>'
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
    if (target instanceof discord_js_1.ChatInputCommandInteraction) {
        return is_embed ? await target.reply({
            embeds: [{
                    color: color[type],
                    description: reply(type, content)
                }],
            flags: ['Ephemeral']
        }) : await target.reply({
            content,
            flags: ['Ephemeral']
        });
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
                '<:001:1012749015969968138>',
                '<:003:1012749019447033966>'
            ])} | ${description}`;
            break;
        case 'warn':
            message = `> ${rand([
                '<:011:1012749035037261844>',
                '<:005:1012749024220155964>',
                '<:004:1012749020852133918>'
            ])} | ${description}`;
            break;
        case 'error':
            message = `> ${rand([
                '<:009:1012749030138335352>',
                '<:002:1012749017798688878>',
                '<:006:1012749025398759425>',
            ])} | ${description}`;
            break;
        case "ok":
            message = `> ${rand([
                '<:007:1012749027508498512>',
                '<:008:1012749028762603550>',
                '<:001:1012749015969968138>'
            ])} | ${description}`;
            break;
        default: message = description;
    }
    return message;
}
function rand(list) {
    return list[Math.floor(Math.random() * list.length)];
}
async function rp_embed(target, message, gif) {
    let image = gif.getUrl() || '';
    await target.reply({
        embeds: [{
                description: message,
                image: { url: image },
                color: random_color(),
                footer: { text: `Name | ${gif.getAnime()}` }
            }]
    });
}
