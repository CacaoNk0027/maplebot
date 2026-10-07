"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReactionCommand = createReactionCommand;
exports.getReactionDefinitions = getReactionDefinitions;
const discord_js_1 = require("discord.js");
const config_1 = require("../config/config");
const action_1 = __importDefault(require("./action"));
const command_data_1 = __importDefault(require("./command_data"));
// Las reacciones nunca se dirigen al bot: el motor responde que no puede usarse
// con él, igual que en las acciones con botCanBeMentioned en false.
const definitions = {
    angry: { id: '001', reaction: 'angry', aliases: ['enojado', 'enojo'], target: 'optional' },
    blush: { id: '002', reaction: 'blush', aliases: ['sonrojo', 'sonrojarse'], target: 'optional' },
    bored: { id: '003', reaction: 'bored', aliases: ['aburrido'], target: 'none' },
    confused: { id: '004', reaction: 'confused', aliases: ['confundido'], target: 'optional' },
    cry: { id: '005', reaction: 'cry', aliases: ['llorar', 'llanto'], target: 'optional' },
    dance: { id: '006', reaction: 'dance', aliases: ['bailar'], target: 'none' },
    disgust: { id: '007', reaction: 'disgust', aliases: ['asco'], target: 'optional' },
    facepalm: { id: '008', reaction: 'facepalm', aliases: ['palmada'], target: 'optional' },
    happy: { id: '009', reaction: 'happy', aliases: ['feliz', 'alegre'], target: 'optional' },
    laugh: { id: '010', reaction: 'laugh', aliases: ['reir', 'risa'], target: 'optional' },
    love: { id: '011', reaction: 'love', aliases: ['amor', 'enamorado'], target: 'optional' },
    nervous: { id: '012', reaction: 'nervous', aliases: ['nervioso'], target: 'none' },
    pout: { id: '013', reaction: 'pout', aliases: ['puchero'], target: 'optional' },
    scream: { id: '014', reaction: 'scream', aliases: ['gritar', 'grito'], target: 'none' },
    shrug: { id: '015', reaction: 'shrug', aliases: ['encoger', 'noseh'], target: 'optional' },
    smug: { id: '016', reaction: 'smug', aliases: ['presumido'], target: 'optional' },
    surprised: { id: '017', reaction: 'surprised', aliases: ['sorprendido', 'sorpresa'], target: 'optional' },
    think: { id: '018', reaction: 'think', aliases: ['pensar'], target: 'optional' },
    thumbsup: { id: '019', reaction: 'like', aliases: ['like', 'pulgar', 'pulgararriba'], target: 'optional' },
    vomit: { id: '020', reaction: 'vomit', aliases: ['vomitar'], target: 'none' },
    wink: { id: '021', reaction: 'wink', aliases: ['guino', 'guiño'], target: 'optional' }
};
function createReactionCommand(name) {
    const definition = definitions[name];
    const descriptionKey = `cmd.006.${definition.id}.description`;
    let data = new command_data_1.default()
        .setName(name)
        .setDescription((0, config_1.text)('es-ES', descriptionKey))
        .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', descriptionKey))
        .setAliases(...(definition.aliases ?? []))
        .setId(definition.id, '006')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(5)
        .ignoreSlash()
        .validForLeveling();
    if (definition.target !== 'none') {
        data = data.addUserOption(new discord_js_1.SlashCommandUserOption()
            .setName('user')
            .setDescription((0, config_1.text)('es-ES', 'system.006.user.option'))
            .setDescriptionLocalization('en-US', (0, config_1.text)('en-US', 'system.006.user.option'))
            .setRequired(false));
    }
    const response = async (target, args) => {
        return await new action_1.default(target, {
            action: definition.reaction,
            category: 'reaction',
            systemPrefix: '006',
            args,
            messageKey: `cmd.006.${definition.id}.message`,
            targetMode: definition.target,
            botCanBeMentioned: false
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
function getReactionDefinitions() {
    return definitions;
}
