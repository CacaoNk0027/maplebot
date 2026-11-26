"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord = __importStar(require("discord.js"));
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../config/config");
const emojis_1 = require("../../../shared/config/emojis");
const topgg_1 = require("../../structs/topgg");
const command = {
    data: new command_data_1.default()
        .setName('vote')
        .setId('010', '001')
        .setAliases('votar', 'voto', 'votos')
        .setCooldown(5)
        .setDescription('Vota por MapleBot en Top.gg')
        .setDescriptionLocalization('en-US', 'Vote for MapleBot on Top.gg'),
    async exec(interaction) {
        await response(interaction);
    },
    async message(message) {
        await response(message);
    },
};
exports.command = command;
async function response(caller) {
    // Top.gg puede tardar más de los 3 s que Discord da para responder.
    if (!(caller instanceof discord.Message))
        await caller.deferReply();
    const locale = await (0, config_1._locale)(caller.guild);
    const userId = caller instanceof discord.Message ? caller.author.id : caller.user.id;
    const vote = await (0, topgg_1.getVoteStatus)(userId);
    // Sin token o sin respuesta de Top.gg, el comando se queda en el enlace.
    const status = !vote ? ''
        : vote.voted
            ? (0, config_1.text)(locale, 'cmd.001.010.voted', discord.time(vote.expiresAt, discord.TimestampStyles.RelativeTime))
            : (0, config_1.text)(locale, 'cmd.001.010.not_voted');
    const embed = new discord.EmbedBuilder()
        .setTitle(`${emojis_1.EMOJI.wink} | ${(0, config_1.text)(locale, 'cmd.001.010.title')}`)
        .setDescription([(0, config_1.text)(locale, 'cmd.001.010.description'), status].filter(Boolean).join('\n\n'))
        .setURL(topgg_1.VOTE_URL)
        .setAuthor({
        name: caller.client.user?.username ?? 'MapleBot',
        iconURL: caller.client.user?.displayAvatarURL({ forceStatic: false })
    })
        .setColor(config_1.theme_color)
        .setThumbnail('https://maplebot.fyi/images/maple.gif');
    const row = new discord.ActionRowBuilder()
        .addComponents(new discord.ButtonBuilder()
        .setLabel((0, config_1.text)(locale, 'cmd.001.010.button'))
        .setStyle(discord.ButtonStyle.Link)
        .setURL(topgg_1.VOTE_URL));
    const payload = { embeds: [embed], components: [row] };
    if (caller instanceof discord.Message)
        await caller.reply(payload);
    else
        await caller.editReply(payload);
}
