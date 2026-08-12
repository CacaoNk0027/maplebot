"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const config_1 = require("../../../bot/config/config");
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const discord_js_1 = require("discord.js");
const Welcome_1 = __importDefault(require("../../../shared/bot/models/Welcome"));
const neekuro_1 = __importDefault(require("neekuro"));
const hex_color_regex_1 = __importDefault(require("hex-color-regex"));
const command = {
    data: new command_data_1.default()
        .setName('welcome')
        .setAliases('bienvenida', 'set-welcome', 'setwlc', 'wlc')
        .setId('002', '004')
        .setDescription('Configura el mensaje de bienvenida para nuevos usuarios')
        .setDescriptionLocalization('en-US', 'Set the welcome message for new members')
        .setUserPermissions('ManageGuild')
        .setBotPermissions('AttachFiles')
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .setCooldown(3)
        .ignoreSlash()
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('test')
        .setDescription('Prueba el sistema de bienvenidas establecido')
        .setDescriptionLocalization('en-US', 'Execute a test for the system')),
    exec: async (interaction) => { },
    message: async (message, args) => {
        if (args[0]?.toLowerCase() == 'test') {
            let welcome = await Welcome_1.default.getByGuildId(message.guildId);
            if (!welcome) {
                await message.reply({
                    content: 'No hay configuración de bienvenida para este servidor. Por favor, configura la bienvenida primero.'
                });
                return;
            }
            const replace_params = (text) => {
                return text.replace(/{user}/g, `${message.author.username}`)
                    .replace(/{server}/g, message.guild?.name || 'Servidor')
                    .replace(/{memberCount}/g, message.guild?.memberCount.toString() || '0');
            };
            const replace_in_message = (text) => {
                return text.replace(/{user}/g, `<@${message.author.id}>`)
                    .replace(/{server}/g, message.guild?.name || 'Servidor')
                    .replace(/{memberCount}/g, message.guild?.memberCount.toString() || '0');
            };
            if (welcome.messageType === 'embed') {
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle(replace_params(welcome.title || '¡Bienvenido {user}!'))
                    .setAuthor({
                    name: message.guild?.name || 'Servidor',
                    iconURL: message.guild?.iconURL() || undefined
                })
                    .setDescription(replace_params(welcome.description || '¡Gracias por unirte!'));
                if (welcome.background?.type === 'color') {
                    const color = welcome.background.value;
                    embed.setColor((0, hex_color_regex_1.default)({ strict: true }).test(color)
                        ? color
                        : '#1a1d1f');
                }
                else {
                    embed.setImage(welcome.background?.value || null);
                }
                await message.reply({
                    content: replace_in_message(welcome.message || '{user}'),
                    embeds: [embed],
                    allowedMentions: { parse: ['users'] }
                });
                return;
            }
            if (welcome.messageType === 'message') {
                await message.reply({
                    content: replace_in_message(welcome.message || `{user} ¡Bienvenido al servidor!`),
                    allowedMentions: { parse: ['users'] }
                });
                return;
            }
            if (welcome.messageType === 'image') {
                let image = new neekuro_1.default.Welcome()
                    .setAvatar(message.author.displayAvatarURL({ extension: 'png', size: 512 }), {
                    border: welcome.colors?.border
                })
                    .setTitle(replace_params(welcome.title || '¡Bienvenido {user}!'), {
                    text_color: welcome.colors?.title
                })
                    .setDescription(replace_params(welcome.description || '¡Gracias por unirte!'), {
                    text_color: welcome.colors?.description
                });
                if (welcome.background?.type === 'color') {
                    image.setBackground('color', welcome.background.value);
                }
                else if (welcome.background?.type === 'image') {
                    image.setBackground('image', welcome.background.value);
                }
                let attachment = new discord_js_1.AttachmentBuilder(await image.build(), { name: 'welcome.png' })
                    .setDescription('Imagen de bienvenida generada');
                await message.reply({
                    content: replace_in_message(welcome.message || `{user}`),
                    files: [attachment],
                    allowedMentions: { parse: ['users'] }
                });
            }
            return;
        }
        await message.reply({
            embeds: [{
                    title: 'Sistema de bienvenidas',
                    description: 'Estas en el menu de configuración del sistema de bienvenidas, selecciona una de las opciones a modificar abajo en el menu',
                    color: (0, config_1.random_color)()
                }],
            components: [{
                    type: discord_js_1.ComponentType.ActionRow,
                    components: [{
                            type: discord_js_1.ComponentType.StringSelect,
                            custom_id: `menu.004:${message.author.id}`,
                            placeholder: 'Selecciona una opción',
                            options: [{
                                    label: 'Tipo de mensaje',
                                    value: '001',
                                    description: 'Selecciona entre tipo embed, mensaje o imagen'
                                }, {
                                    label: 'Canal de bienvenidas',
                                    value: '002',
                                    description: 'Selecciona el canal donde se enviaran los mensajes de bienvenida'
                                }, {
                                    label: 'Título del mensaje',
                                    value: '003',
                                    description: 'Cambia el título del mensaje de bienvenida'
                                }, {
                                    label: 'Descripción del mensaje',
                                    value: '004',
                                    description: 'Cambia la descripción del mensaje de bienvenida'
                                }, {
                                    label: 'Mensaje de bienvenida',
                                    value: '005',
                                    description: 'Cambia el mensaje de bienvenida escrito'
                                }, {
                                    label: 'Fondo de bienvenida',
                                    value: '006',
                                    description: 'Configura un color o imagen de fondo'
                                }, {
                                    label: 'Colores de bienvenida',
                                    value: '007',
                                    description: 'Configura los colores del mensaje de imagen'
                                }]
                        }]
                }]
        });
    }
};
exports.command = command;
