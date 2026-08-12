"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const discord_js_1 = require("discord.js");
const command_data_1 = __importDefault(require("../../structs/command_data"));
const config_1 = require("../../../bot/config/config");
const Farewell_1 = __importDefault(require("../../../shared/bot/models/Farewell"));
const hex_color_regex_1 = __importDefault(require("hex-color-regex"));
const neekuro_1 = __importDefault(require("neekuro"));
const command = {
    data: new command_data_1.default()
        .setName('farewell')
        .setAliases('despedida', 'set-farewell', 'setfrw', 'frw')
        .setId('003', '004')
        .setDescription('Configura un mensaje de despedida para usuarios que salgan del servidor')
        .setDescriptionLocalization('en-US', 'Set the farewell message for users who leave the guild')
        .setUserPermissions('ManageGuild')
        .setBotPermissions('AttachFiles')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(3)
        .ignoreSlash()
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('test')
        .setDescription('Prueba el sistema de despedidas establecido')
        .setDescriptionLocalization('en-US', 'Execute a test for the system')),
    exec: async (interaction) => {
    },
    message: async (message, args) => {
        if (args[0]?.toLowerCase() == 'test') {
            let farewell = await Farewell_1.default.getByGuildId(message.guildId);
            if (!farewell) {
                await message.reply({
                    embeds: [{
                            description: (0, config_1.reply)('error', 'No hay un sistema de despedidas para este servidor. Configura uno antes para usar esto'),
                            color: discord_js_1.Colors.Red
                        }]
                });
                return;
            }
            const replace_params = (text) => {
                return text.replace(/{user}/g, `${message.author.username}`)
                    .replace(/{server}/g, message.guild?.name || 'Servidor')
                    .replace(/{memberCount}/g, message.guild?.memberCount.toString() || '0');
            };
            if (farewell.messageType == 'embed') {
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle(replace_params(farewell.title || 'Hasta pronto {user}'))
                    .setAuthor({
                    name: message.guild?.name || 'Servidor',
                    iconURL: message.guild?.iconURL() || undefined
                })
                    .setDescription(replace_params(farewell.description || 'Un placer tenerte con nosotros'));
                if (farewell.background?.type == 'color') {
                    const color = farewell.background.value;
                    embed.setColor((0, hex_color_regex_1.default)({ strict: true }).test(color) ? color : '#1a1d1f');
                }
                else {
                    embed.setImage(farewell.background?.value || null);
                }
                await message.reply({
                    content: replace_params(farewell.message || '{user}'),
                    embeds: [embed],
                    allowedMentions: { parse: ['users'] }
                });
                return;
            }
            if (farewell.messageType === 'message') {
                await message.reply({
                    content: replace_params(farewell.message || `{user} Ha salido del servidor.`),
                    allowedMentions: { parse: ['users'] }
                });
                return;
            }
            if (farewell.messageType == 'image') {
                let image = new neekuro_1.default.Welcome()
                    .setAvatar(message.author.displayAvatarURL({ extension: 'png', size: 512 }), {
                    border: farewell.colors?.border
                })
                    .setTitle(replace_params(farewell.title || 'Adiós {user}.'), {
                    text_color: farewell.colors?.title
                })
                    .setDescription(replace_params(farewell.description || 'Un placer tenerte'), {
                    text_color: farewell.colors?.description
                });
                if (farewell.background?.type === 'color') {
                    image.setBackground('color', farewell.background.value);
                }
                else if (farewell.background?.type === 'image') {
                    image.setBackground('image', farewell.background.value);
                }
                let attachment = new discord_js_1.AttachmentBuilder(await image.build(), { name: 'farewell.png' })
                    .setDescription('Imagen de despedida generada');
                await message.reply({
                    content: replace_params(farewell.message || `{user}`),
                    files: [attachment],
                    allowedMentions: { parse: ['users'] }
                });
            }
            return;
        }
        await message.reply({
            embeds: [{
                    title: 'Sistema de despedidas',
                    description: 'Estas en el menu de configuración del sistema de despedidas, selecciona una de las opciones a modificar en el menu de abajo',
                    color: (0, config_1.random_color)()
                }],
            components: [{
                    type: discord_js_1.ComponentType.ActionRow,
                    components: [{
                            type: discord_js_1.ComponentType.StringSelect,
                            custom_id: `menu.005:${message.author.id}`,
                            options: [{
                                    label: 'Tipo de mensaje',
                                    value: '001',
                                    description: 'Selecciona entre tipo embed, mensaje o imagen'
                                }, {
                                    label: 'Canal de despedidas',
                                    value: '002',
                                    description: 'Selecciona el canal donde se enviaran los mensajes de despedida'
                                }, {
                                    label: 'Título del mensaje',
                                    value: '003',
                                    description: 'Cambia el título del mensaje de despedida'
                                }, {
                                    label: 'Descripción del mensaje',
                                    value: '004',
                                    description: 'Cambia la descripción del mensaje de despedida'
                                }, {
                                    label: 'Mensaje de despedida',
                                    value: '005',
                                    description: 'Cambia el mensaje de despedida escrito'
                                }, {
                                    label: 'Fondo de despedida',
                                    value: '006',
                                    description: 'Configura un color o imagen de fondo'
                                }, {
                                    label: 'Colores de despedida',
                                    value: '007',
                                    description: 'Configura los colores del mensaje de imagen'
                                }]
                        }]
                }]
        });
    }
};
exports.command = command;
