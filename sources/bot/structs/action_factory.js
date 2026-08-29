"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActionCommand = createActionCommand;
exports.getActionDefinitions = getActionDefinitions;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const action_1 = __importDefault(require("./action"));
const command_data_1 = __importDefault(require("./command_data"));
const definitions = {
    cook: { id: '001', action: 'cook', aliases: ['cocinar'], target: 'optional' },
    cuddle: { id: '002', action: 'cuddle', aliases: ['acurrucarse', 'acurrucar', 'cud'], target: 'required' },
    cure: { id: '003', action: 'cure', aliases: ['curar', 'sanar'], target: 'optional' },
    draw: { id: '004', action: 'draw', aliases: ['dibujar'], target: 'none', botCanBeMentioned: false },
    drive: { id: '005', action: 'drive', aliases: ['conducir', 'manejar'], target: 'none', botCanBeMentioned: false },
    eat: { id: '006', action: 'eat', aliases: ['comer'], target: 'none', botCanBeMentioned: false },
    feed: { id: '007', action: 'feed', aliases: ['alimentar'], target: 'required' },
    handwash: { id: '008', aliases: ['hdw', 'handw', 'lavarmanos', 'lavarsemanos'], target: 'none', inactive: true },
    hug: { id: '009', action: 'hug', aliases: ['abrazo', 'abrazar'], target: 'required', statistic: 'received' },
    kickbut: { id: '010', action: 'kickbut', aliases: ['patada', 'patear'], target: 'required', botCanBeMentioned: false, botEasterEgg: 'retaliation', statistic: 'pair' },
    kill: { id: '011', action: 'kill', aliases: ['matar', 'asesinar'], target: 'required', botCanBeMentioned: false, botEasterEgg: 'retaliation' },
    kiss: { id: '012', action: 'kiss', aliases: ['besar'], target: 'required', botCanBeMentioned: false, botEasterEgg: 'kiss', statistic: 'pair' },
    lick: { id: '013', action: 'lick', aliases: ['lamer'], target: 'required', botCanBeMentioned: false, statistic: 'pair' },
    pat: { id: '014', action: 'pat', aliases: ['acariciar', 'caricia'], target: 'required', statistic: 'received' },
    peek: { id: '015', action: 'peek', aliases: ['espiar', 'vistazo'], target: 'required', botCanBeMentioned: false },
    play: { id: '016', action: 'playing', aliases: ['jugar', 'playing'], target: 'optional' },
    poke: { id: '017', action: 'poke', aliases: ['molestar', 'fastidio', 'fastidiar'], target: 'required', botCanBeMentioned: false },
    punch: { id: '018', action: 'punch', aliases: ['golpear'], target: 'required', botCanBeMentioned: false, botEasterEgg: 'retaliation', statistic: 'received' },
    read: { id: '019', aliases: ['leer'], target: 'none', inactive: true },
    run: { id: '020', action: 'run', aliases: ['correr'], target: 'none', botCanBeMentioned: false },
    sape: { id: '021', action: 'sape', aliases: ['zape'], target: 'required', botCanBeMentioned: false, botEasterEgg: 'retaliation', statistic: 'received' },
    shot: { id: '022', action: 'shoot', aliases: ['disparar'], target: 'optional', botCanBeMentioned: false, botEasterEgg: 'retaliation' },
    sip: { id: '023', action: 'sip', aliases: ['beber'], target: 'none', botCanBeMentioned: false },
    slap: { id: '024', action: 'slap', aliases: ['bofetear'], target: 'required', botCanBeMentioned: false, botEasterEgg: 'retaliation' },
    sleep: { id: '025', action: 'sleep', aliases: ['dormir'], target: 'optional' },
    stare: { id: '026', action: 'stare', aliases: ['mirar', 'observar'], target: 'optional' },
    tickle: { id: '027', action: 'tickle', aliases: ['cosquillas'], target: 'required' },
    travel: { id: '028', action: 'travel', aliases: ['viajar'], target: 'none' },
    write: { id: '029', action: 'work', aliases: ['escribir'], target: 'none' }
};
function createActionCommand(name) {
    const definition = definitions[name];
    const descriptionKey = `cmd.005.${definition.id}.description`;
    let data = new command_data_1.default()
        .setName(name)
        .setDescription((0, config_1.text)('es-ES', descriptionKey))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', descriptionKey))
        .setAliases(...(definition.aliases ?? []))
        .setId(definition.id, '005')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .ignoreSlash();
    if (!definition.inactive)
        data = data.validForLeveling();
    if (definition.inactive)
        data = data.setInactive();
    if (definition.target !== 'none') {
        data = data.addUserOption(new discord_js_1.SlashCommandUserOption()
            .setName('user')
            .setDescription((0, config_1.text)('es-ES', 'system.005.user.option'))
            .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'system.005.user.option'))
            .setRequired(definition.target === 'required'));
    }
    const response = async (target, args) => {
        if (!definition.action)
            return false;
        return await new action_1.default(target, {
            action: definition.action,
            args,
            messageKey: `cmd.005.${definition.id}.message`,
            targetMode: definition.target,
            botCanBeMentioned: definition.botCanBeMentioned,
            botEasterEgg: definition.botEasterEgg,
            statistic: definition.statistic
                ? { name: definition.action, mode: definition.statistic }
                : undefined
        }).execute();
    };
    return {
        data,
        exec: async (interaction) => {
            await response(interaction);
        },
        message: response
    };
}
function getActionDefinitions() {
    return definitions;
}
