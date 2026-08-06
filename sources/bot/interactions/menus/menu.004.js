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
exports.interaction = void 0;
const interaction_data_1 = __importDefault(require("../../../bot/structs/interaction_data"));
const discord = __importStar(require("discord.js"));
const interaction = {
    data: new interaction_data_1.default()
        .setId('menu.004')
        .setUnique(),
    async exec(interaction, message) {
        if (!interaction.isStringSelectMenu())
            return;
        const modal = new discord.ModalBuilder();
        let seleccionador = interaction.values[0];
        if (seleccionador === '001') {
            modal.setCustomId('modal.001')
                .setTitle('Tipo de mensaje de bienvenida');
            let selector = new discord.StringSelectMenuBuilder()
                .setCustomId('menu.004.001')
                .setPlaceholder('Opciones...')
                .setRequired(true)
                .addOptions(new discord.StringSelectMenuOptionBuilder()
                .setLabel('Tipo Embed')
                .setDescription('un mensaje en un cuadro de texto grande')
                .setValue('1'), new discord.StringSelectMenuOptionBuilder()
                .setLabel('Tipo Imagen')
                .setDescription('un mensaje que envía una imagen de bienvenida')
                .setValue('2'), new discord.StringSelectMenuOptionBuilder()
                .setLabel('Tipo Mensaje')
                .setDescription('Un mensaje de texto común')
                .setValue('3'));
            let label = new discord.LabelBuilder()
                .setLabel('selecciona una opción')
                .setStringSelectMenuComponent(selector);
            modal.addLabelComponents(label);
            await interaction.showModal(modal);
            return;
        }
        if (seleccionador === '002') {
            modal.setCustomId('modal.002')
                .setTitle('Canal de bienvenidas');
            let selector = new discord.ChannelSelectMenuBuilder()
                .setCustomId('menu.004.002')
                .setChannelTypes([discord.ChannelType.GuildText])
                .setPlaceholder('Canales...')
                .setRequired(true);
            let label = new discord.LabelBuilder()
                .setLabel('Selecciona un canal de texto')
                .setChannelSelectMenuComponent(selector);
            modal.addLabelComponents(label);
            await interaction.showModal(modal);
            return;
        }
        if (seleccionador === '003') {
            modal.setCustomId('modal.003')
                .setTitle('Titulo del mensaje de bienvenida');
            let title = new discord.LabelBuilder()
                .setLabel('Titulo a mostrar')
                .setTextInputComponent(new discord.TextInputBuilder()
                .setCustomId('menu.004.003.title')
                .setPlaceholder('Titulo del mensaje de bienvenida')
                .setStyle(discord.TextInputStyle.Short)
                .setMaxLength(40)
                .setRequired(true));
            modal.addLabelComponents(title);
            await interaction.showModal(modal);
            return;
        }
        if (seleccionador === '004') {
            modal.setCustomId('modal.004')
                .setTitle('Descripción del mensaje de bienvenida');
            let description = new discord.LabelBuilder()
                .setLabel('Descripción a mostrar')
                .setTextInputComponent(new discord.TextInputBuilder()
                .setCustomId('menu.004.004.description')
                .setPlaceholder('Descripción del mensaje de bienvenida')
                .setMaxLength(60)
                .setStyle(discord.TextInputStyle.Short)
                .setRequired(true));
            modal.addLabelComponents(description);
            await interaction.showModal(modal);
            return;
        }
        if (seleccionador === '005') {
            modal.setCustomId('modal.005')
                .setTitle('Mensaje de bienvenida');
            let message = new discord.LabelBuilder()
                .setLabel('Mensaje a mostrar')
                .setTextInputComponent(new discord.TextInputBuilder()
                .setCustomId('menu.004.005.message')
                .setPlaceholder('Mensaje de bienvenida')
                .setMaxLength(400)
                .setStyle(discord.TextInputStyle.Paragraph)
                .setRequired(true));
            let params = new discord.LabelBuilder()
                .setLabel('Parametros a usar')
                .setDescription('\n`{user}` > Mencion a usuario\n`{server}` > Nombre del servidor\n`{count}` > Cantidad de miembros del servidor');
            modal.addLabelComponents(message, params);
            await interaction.showModal(modal);
            return;
        }
        if (seleccionador === '006') {
            modal.setCustomId('modal.006')
                .setTitle('Fondo de la bienvenida');
            let label = new discord.LabelBuilder()
                .setLabel('Selecciona un tipo de fondo')
                .setStringSelectMenuComponent(new discord.StringSelectMenuBuilder()
                .setCustomId('menu.004.006')
                .setPlaceholder('Opciones...')
                .setRequired(true)
                .addOptions(new discord.StringSelectMenuOptionBuilder()
                .setLabel('Color')
                .setDescription('Establece un color de fondo para el mensaje')
                .setValue('default'), new discord.StringSelectMenuOptionBuilder()
                .setLabel('Imagen')
                .setDescription('Usa una imagen o gif como fondo')
                .setValue('custom')));
            let value = new discord.LabelBuilder()
                .setLabel('Color hexadecimal o URL de imagen')
                .setTextInputComponent(new discord.TextInputBuilder()
                .setCustomId('menu.004.006.value')
                .setPlaceholder('#1a1d1f o https://ejemplo.com/fondo.png')
                .setStyle(discord.TextInputStyle.Short)
                .setRequired(false));
            modal.addLabelComponents(label, value);
            await interaction.showModal(modal);
            return;
        }
        if (seleccionador === '007') {
            modal.setCustomId('modal.007')
                .setTitle('Colores del mensaje de bienvenida');
            let colorLabel = new discord.LabelBuilder()
                .setLabel('Color del titulo')
                .setDescription('esto solo aplica si el mensaje es una imagen')
                .setTextInputComponent(new discord.TextInputBuilder()
                .setCustomId('menu.004.007.text')
                .setPlaceholder('#ffffff')
                .setStyle(discord.TextInputStyle.Short)
                .setRequired(false));
            let descriptionLabel = new discord.LabelBuilder()
                .setLabel('Color de la descripción')
                .setDescription('esto solo aplica si el mensaje es una imagen')
                .setTextInputComponent(new discord.TextInputBuilder()
                .setCustomId('menu.004.007.background')
                .setPlaceholder('#1a1d1f')
                .setStyle(discord.TextInputStyle.Short)
                .setRequired(false));
            let borderImageColorLabel = new discord.LabelBuilder()
                .setLabel('Color del borde del avatar')
                .setDescription('esto solo aplica si el mensaje es una imagen')
                .setTextInputComponent(new discord.TextInputBuilder()
                .setCustomId('menu.004.007.border')
                .setPlaceholder('#1a1d1f')
                .setStyle(discord.TextInputStyle.Short)
                .setRequired(false));
            modal.addLabelComponents(colorLabel, descriptionLabel, borderImageColorLabel);
            await interaction.showModal(modal);
            return;
        }
        await interaction.reply({
            content: '> Opción de configuración desconocida.',
            flags: ['Ephemeral']
        });
    }
};
exports.interaction = interaction;
