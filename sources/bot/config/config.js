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
        Staff: '<:staff:1533961256329941153>',
        Partner: '<:partner:1533971787749265532>',
        Hypesquad: '<:hypesquad:1533961258552787026>',
        BugHunterLevel1: '<:bughunter1:1533971876630499528>',
        HypeSquadOnlineHouse1: '<:bravery:1533961213359423599>',
        HypeSquadOnlineHouse2: '<:brilliance:1533961205885047045>',
        HypeSquadOnlineHouse3: '<:balance:1533961197765001428>',
        PremiumEarlySupporter: '<:earlynitro:1533961141968044122>',
        BugHunterLevel2: '<:bughunter2:1533960902339068166>',
        VerifiedDeveloper: '<:earlydev:1533961060095365120>',
        CertifiedModerator: '<:moderator:1533961001966239795>'
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
                '<:okay:1533702743233925160>',
                '<:tea:1533702747033964615>'
            ])} | ${description}`;
            break;
        case 'warn':
            message = `> ${rand([
                '<:angry:1533702738930696362>',
                '<:idk:1533702736980218018>'
            ])} | ${description}`;
            break;
        case 'error':
            message = `> ${rand([
                '<:fall:1533702734602309662>',
                '<:confused:1533702742051127507>',
                '<:surprise:1533702740340113520>',
            ])} | ${description}`;
            break;
        case "ok":
            message = `> ${rand([
                '<:kiss:1533702798372245565>',
                '<:wink:1533702744895000596>',
                '<:tea:1533702747033964615>'
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
