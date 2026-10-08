"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_handler_1 = require("../../bot/config/command_handler");
const interaction_handler_1 = require("../../bot/config/interaction_handler");
const config_1 = require("../config/config");
const update_notice_1 = require("../structs/update_notice");
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
            if (interaction.isButton()) {
                await button_click(interaction);
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
    const locale = await (0, config_1._locale)(interaction.guild);
    let commands = await (0, command_handler_1.load_commands)();
    let command = commands.get(interaction.commandName);
    if (!command) {
        await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'interaction.command.unknown'), true);
        return;
    }
    try {
        await command.exec(interaction);
        // Mismo criterio que en el despachador de prefijo: al final y aislado,
        // para que no arrastre al comando si falla.
        if (interaction.guild) {
            await (0, update_notice_1.maybeAnnounceUpdate)(interaction.guild, interaction.channel?.isTextBased() && !interaction.channel.isDMBased()
                ? interaction.channel
                : null).catch(announceError => {
                console.warn('[InteractionCreate:WARN]! no se pudo anunciar la actualizacion:', announceError);
            });
        }
    }
    catch (error) {
        console.error('[InteractionCreate:ERR]! ha ocurrido un error al ejecutar un comando:', error);
        try {
            await (0, config_1.send)(interaction, 'error', (0, config_1.text)(locale, 'reply.error'), true);
        }
        catch (replyError) {
            console.error('[InteractionCreate:ERR]! no se ha podido editar el mensaje de error al ejecutar:', replyError);
        }
    }
}
async function select_menu(interaction) {
    const [menuId, ownerId] = interaction.customId.split(':', 2);
    // Igual que con los botones: un menú que viva en un colector no está en el
    // registro y lo atiende quien lo creó. Hoy no hay ninguno, pero el día que
    // se añada heredaría la misma carrera por una interacción de un solo uso.
    if (!menuId?.startsWith('menu.'))
        return;
    const locale = await (0, config_1._locale)(interaction.guild);
    let interactions = await (0, interaction_handler_1.load_interactions)();
    let menu = interactions.filter(target => target.data.id.startsWith("menu.")).get(menuId);
    if (!menu) {
        await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'interaction.menu.unknown'), true);
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
                await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'interaction.menu.owner'), true);
                return;
            }
        }
        await menu.exec(interaction, interaction.message);
    }
    catch (error) {
        console.error('[InteractionCreate:ERR]! ha ocurrido un error al ejecutar un menu:', error);
        try {
            await (0, config_1.send)(interaction, 'error', (0, config_1.text)(locale, 'reply.error'), true);
        }
        catch (replyError) {
            console.error('[InteractionCreate:ERR]! no se ha podido editar el mensaje de error al ejecutar:', replyError);
        }
    }
}
async function button_click(interaction) {
    // Mismo formato que los menús: `button.NNN:dueño:dato`. Solo se extrae el
    // dueño para la comprobación; cada manejador lee del `customId` los datos
    // que le interesan, en el mismo orden en que los escribió.
    const [buttonId, ownerId] = interaction.customId.split(':');
    // Los botones de un colector (paginación, confirmaciones de AutoMod) no
    // están en el registro: los atiende quien los creó. El despachador tiene
    // que desentenderse de ellos, porque una interacción es de un solo uso y
    // ambos manejadores reciben el evento: si contestara aquí, consumiría la
    // interacción y el colector fallaría con 10062 al confirmarla. Ganaba el
    // colector solo porque el despachador leía antes el idioma, así que era
    // una carrera, no un orden garantizado.
    if (!buttonId?.startsWith('button.'))
        return;
    const locale = await (0, config_1._locale)(interaction.guild);
    const button = (await (0, interaction_handler_1.load_buttons)()).get(buttonId);
    if (!button) {
        await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'interaction.button.unknown'), true);
        return;
    }
    // Un panel enviado por prefijo lo ve todo el canal: sin esta comprobación
    // cualquiera podría pulsar los botones de otro.
    if (button.data.unique && ownerId !== interaction.user.id) {
        await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'interaction.button.owner'), true);
        return;
    }
    try {
        await button.exec(interaction);
    }
    catch (error) {
        console.error('[InteractionCreate:ERR]! ha ocurrido un error al ejecutar un boton:', error);
        await (0, config_1.send)(interaction, 'error', (0, config_1.text)(locale, 'reply.error'), true).catch(replyError => {
            console.error('[InteractionCreate:ERR]! no se pudo responder el error del boton:', replyError);
        });
    }
}
async function modal_submit(interaction) {
    const locale = await (0, config_1._locale)(interaction.guild);
    const modals = await (0, interaction_handler_1.load_modals)();
    // Los modales con parámetros usan `modal.NNN:dato:dato`; los antiguos
    // siguen resolviéndose por igualdad exacta.
    const modal = modals.get(interaction.customId)
        ?? modals.find(candidate => interaction.customId.startsWith(`${candidate.data.id}:`));
    if (!modal) {
        await (0, config_1.send)(interaction, 'warn', (0, config_1.text)(locale, 'interaction.modal.unknown'), true);
        return;
    }
    try {
        await modal.exec(interaction);
    }
    catch (error) {
        console.error('[InteractionCreate:ERR]! ha ocurrido un error al ejecutar un modal:', error);
        await (0, config_1.send)(interaction, 'error', (0, config_1.text)(locale, 'reply.error'), true).catch(replyError => {
            console.error('[InteractionCreate:ERR]! no se pudo responder el error del modal:', replyError);
        });
    }
}
exports.default = event;
