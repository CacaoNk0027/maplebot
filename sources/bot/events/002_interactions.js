"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_handler_1 = require("../../bot/config/command_handler");
const interaction_handler_1 = require("../../bot/config/interaction_handler");
const command_handler_2 = require("../../bot/private/handlers/command_handler");
const event = {
    name: discord_js_1.Events.InteractionCreate,
    async exec(interaction) {
        try {
            if (interaction.isChatInputCommand()) {
                await slash_command(interaction);
                return;
            }
            if (interaction.type == discord_js_1.InteractionType.MessageComponent && interaction.isAnySelectMenu()) {
                await select_menu(interaction);
                return;
            }
            if (interaction.isModalSubmit()) {
                await modal_submit(interaction);
                return;
            }
        }
        catch (error) {
            console.error('[InteractionCreate:ERR]! Ha ocurrido un error inesperado', error);
        }
    }
};
async function slash_command(interaction) {
    const privateCommands = await (0, command_handler_2.load_private_commands)();
    const privateCommand = privateCommands.get(interaction.commandName)
        || privateCommands.find(command => command.data.id === interaction.commandName || command.data.alias.includes(interaction.commandName));
    if (privateCommand?.guild === interaction.guildId) {
        await privateCommand.exec(interaction);
        return;
    }
    let commands = await (0, command_handler_1.load_commands)();
    let command = commands.get(interaction.commandName);
    if (!command) {
        await interaction.reply({
            content: '> Comando desconocido!? Intenta ver el menu help, si crees que se trata de un error comunicate con el desarrollador',
            flags: ['Ephemeral']
        });
        return;
    }
    try {
        await command.exec(interaction);
    }
    catch (error) {
        console.error('[InteractionCreate:ERR]! ha ocurrido un error al ejecutar un comando:', error);
        let errorMessage = '> No se pudo procesar bien la ejecucion del comando, comunicate con el desarrollador';
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: errorMessage,
                    flags: ['Ephemeral'],
                });
            }
            else {
                await interaction.reply({
                    content: errorMessage,
                    flags: ['Ephemeral'],
                });
            }
        }
        catch (replyError) {
            console.error('[InteractionCreate:ERR]! no se ha podido editar el mensaje de error al ejecutar:', replyError);
        }
    }
}
async function select_menu(interaction) {
    let interactions = await (0, interaction_handler_1.load_interactions)();
    const [menuId, ownerId] = interaction.customId.split(':', 2);
    let menu = interactions.filter(target => target.data.id.startsWith("menu.")).get(menuId);
    if (!menu) {
        await interaction.reply({
            content: '> Menu desconocido!? Intenta ver el menu help, si crees que se trata de un error comunicate con el desarrollador',
            flags: ['Ephemeral']
        });
        return;
    }
    try {
        if (menu.data.unique) {
            let isOwner = ownerId === interaction.user.id;
            if (!ownerId) {
                let user = interaction.message.interactionMetadata?.user;
                if (!user && interaction.message.reference?.messageId) {
                    const referencedMessage = await interaction.message.channel.messages.fetch(interaction.message.reference.messageId);
                    user = referencedMessage.author;
                }
                isOwner = interaction.user.id === user?.id;
            }
            if (!isOwner) {
                await interaction.reply({
                    content: '> Este menu es unico y no puedes interactuar con el.',
                    flags: ['Ephemeral']
                });
                return;
            }
        }
        await menu.exec(interaction, interaction.message);
    }
    catch (error) {
        console.error('[InteractionCreate:ERR]! ha ocurrido un error al ejecutar un menu:', error);
        let errorMessage = '> No se pudo procesar bien la ejecucion del menu, comunicate con el desarrollador';
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: errorMessage,
                    flags: ['Ephemeral'],
                });
            }
            else {
                await interaction.reply({
                    content: errorMessage,
                    flags: ['Ephemeral'],
                });
            }
        }
        catch (replyError) {
            console.error('[InteractionCreate:ERR]! no se ha podido editar el mensaje de error al ejecutar:', replyError);
        }
    }
}
async function modal_submit(interaction) {
    const modals = await (0, interaction_handler_1.load_modals)();
    const modal = modals.get(interaction.customId);
    if (!modal) {
        await interaction.reply({
            content: '> Modal desconocido. Intenta ejecutar el comando otra vez.',
            flags: ['Ephemeral']
        });
        return;
    }
    try {
        await modal.exec(interaction);
    }
    catch (error) {
        console.error('[InteractionCreate:ERR]! ha ocurrido un error al ejecutar un modal:', error);
        if (interaction.replied || interaction.deferred)
            return;
        await interaction.reply({
            content: '> No se pudo procesar el formulario. Intenta de nuevo.',
            flags: ['Ephemeral']
        }).catch(replyError => {
            console.error('[InteractionCreate:ERR]! no se pudo responder el error del modal:', replyError);
        });
    }
}
exports.default = event;
