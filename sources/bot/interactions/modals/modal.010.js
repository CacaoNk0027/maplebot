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
exports.modal = void 0;
const Farewell_1 = __importDefault(require("../../../shared/bot/models/Farewell"));
const config_1 = require("../../config/config");
const interaction_data_1 = __importDefault(require("../../structs/interaction_data"));
const discord = __importStar(require("discord.js"));
const modal = {
    data: new interaction_data_1.default().setId('modal.010'),
    async exec(interaction) {
        const title = interaction.fields.getTextInputValue('menu.005.003.title');
        if (!title || !interaction.guildId) {
            await interaction.reply({
                content: 'Hubo un error al intentar guardar el titulo del mensaje de despedida.',
                flags: ['Ephemeral']
            });
            return;
        }
        try {
            await Farewell_1.default.setTitle(interaction.guildId, title);
        }
        catch (error) {
            console.error('Error al guardar el titulo del mensaje de despedida:', error);
            await interaction.reply({
                content: (0, config_1.reply)('error', 'Hubo un error al intentar guardar el titulo del mensaje de despedida.'),
                flags: ['Ephemeral']
            });
            return;
        }
        await interaction.reply({
            embeds: [{
                    description: (0, config_1.reply)('ok', 'se ha establecido un nuevo titulo'),
                    color: discord.Colors.Green,
                    fields: [{
                            name: 'Titulo',
                            value: `\`${title}\``
                        }]
                }],
            flags: ['Ephemeral']
        });
    }
};
exports.modal = modal;
