"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const command_data_1 = __importDefault(require("../../../bot/structs/command_data"));
const discord_js_1 = require("discord.js");
const config_1 = require("../../../bot/config/config");
const command = {
    data: new command_data_1.default()
        .setName('automod')
        .setAliases('automoderacion', 'automoderation', 'adm')
        .setDescription('Gestiona la automoderación de tu servidor')
        .setDescriptionLocalization('en-US', 'Manage your server\'s auto-moderation')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
        .setBotPermissions('Administrator')
        .setUserPermissions('Administrator')
        .setId('002', '003')
        .setCooldown(5)
        .setContexts(discord_js_1.InteractionContextType.Guild)
        .ignoreSlash()
        .setInactive()
        .addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('not-allowed')
        .setDescription('Bloquea contenido sexual, mal lenguaje, entre otros (unicamente disponible en ingles)')
        .setDescriptionLocalization('en-US', 'Blocks sexual content, bad language, among others')).addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('no-spam')
        .setDescription('Bloquea mensajes detectados como spam (unicamente disponible en ingles)')
        .setDescriptionLocalization('en-US', 'Blocks messages detected as spam')).addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('spam-mentions')
        .setDescription('Bloquea menciones excesivas')
        .setDescriptionLocalization('en-US', 'Blocks excessive mentions')).addSubcommand(new discord_js_1.SlashCommandSubcommandBuilder()
        .setName('blacklist')
        .setDescription('Añade palabras personalizadas a una lista negra')
        .setDescriptionLocalization('en-US', 'Adds custom words to a blacklist')
        .addStringOption(new discord_js_1.SlashCommandStringOption()
        .setName('word')
        .setDescription('La palabra a añadir a la lista negra')
        .setDescriptionLocalization('en-US', 'The word to add to the blacklist')
        .setRequired(true))),
    async exec(interaction) {
        let option = interaction.options.getSubcommand();
        switch (option) {
            case 'not-allowed':
                await not_allowed(interaction);
                break;
            case 'no-spam':
                await no_spam(interaction);
                break;
            case 'spam-mentions':
                await spam_mentions(interaction);
                break;
            case 'blacklist':
                await blacklist(interaction, [interaction.options.getString('word', true)]);
                break;
        }
    },
    async message(message, args) {
        let option = args[0]?.toLowerCase();
        if (!option) {
            await (0, config_1.send)(message, 'warn', 'Debes especificar una opción: `not-allowed`, `no-spam`, `spam-mentions`, `blacklist`', true);
            return;
        }
        switch (option) {
            case 'not-allowed':
                await not_allowed(message);
                break;
            case 'no-spam':
                await no_spam(message);
                break;
            case 'spam-mentions':
                await spam_mentions(message);
                break;
            case 'blacklist':
                if (!args[1]) {
                    await (0, config_1.send)(message, 'warn', 'Debes especificar una palabra o escribir una lista de palabras separadas por espacio para añadir a la lista negra.', true);
                    return;
                }
                await blacklist(message, args.slice(1));
                break;
        }
    }
};
exports.command = command;
async function not_allowed(target) {
    try {
        let has_same_rule = await target.guild?.autoModerationRules.fetch().then(rules => rules.filter(rule => rule.triggerType === discord_js_1.AutoModerationRuleTriggerType.KeywordPreset));
        if (has_same_rule && has_same_rule?.size >= 1) {
            await (0, config_1.send)(target, 'warn', 'Ya existe una regla de automoderación para contenido no apto.', true);
            return;
        }
        let rule = await target.guild?.autoModerationRules.create({
            name: 'Bloqueo de contenido no apto',
            enabled: true,
            eventType: discord_js_1.AutoModerationRuleEventType.MessageSend,
            triggerType: discord_js_1.AutoModerationRuleTriggerType.KeywordPreset,
            triggerMetadata: {
                presets: [1, 2, 3]
            },
            actions: [{
                    type: discord_js_1.AutoModerationActionType.BlockMessage,
                    metadata: {
                        customMessage: 'Tu mensaje ha sido bloqueado por contener contenido no apto.'
                    }
                }]
        });
        if (!rule) {
            await (0, config_1.send)(target, 'error', 'No se pudo establecer la regla de automoderación.', true);
            return;
        }
        await (0, config_1.send)(target, 'ok', 'Se ha establecido una nueva regla de automoderación.', true);
    }
    catch (error) {
        console.error(error);
        await (0, config_1.send)(target, 'error', 'Ha ocurrido un error al establecer la regla de automoderación.', true);
    }
}
async function no_spam(target) {
    try {
        let has_same_rule = await target.guild?.autoModerationRules.fetch().then(rules => rules.filter(rule => rule.triggerType === discord_js_1.AutoModerationRuleTriggerType.Spam));
        if (has_same_rule && has_same_rule?.size >= 1) {
            await (0, config_1.send)(target, 'warn', 'Ya existe una regla de automoderación para spam.', true);
            return;
        }
        let rule = await target.guild?.autoModerationRules.create({
            name: 'Bloqueo de contenido spam',
            enabled: true,
            eventType: discord_js_1.AutoModerationRuleEventType.MessageSend,
            triggerType: discord_js_1.AutoModerationRuleTriggerType.Spam,
            triggerMetadata: {},
            actions: [{
                    type: discord_js_1.AutoModerationActionType.BlockMessage,
                    metadata: {
                        customMessage: '> Tu mensaje ha sido bloqueado por ser sospechoso de spam.',
                        durationSeconds: 10
                    }
                }]
        });
        if (!rule) {
            await (0, config_1.send)(target, 'error', 'No se pudo establecer la regla de automoderación.', true);
            return;
        }
        await (0, config_1.send)(target, 'ok', 'Se ha establecido una nueva regla de automoderación.', true);
    }
    catch (error) {
        console.error(error);
        await (0, config_1.send)(target, 'error', 'Ha ocurrido un error al establecer la regla de automoderación.', true);
    }
}
async function spam_mentions(target) {
    try {
        let has_same_rule = await target.guild?.autoModerationRules.fetch().then(rules => rules.filter(rule => rule.triggerType === discord_js_1.AutoModerationRuleTriggerType.MentionSpam));
        if (has_same_rule && has_same_rule?.size >= 1) {
            await (0, config_1.send)(target, 'warn', 'Ya existe una regla de automoderación para menciones spam.', true);
            return;
        }
        let rule = await target.guild?.autoModerationRules.create({
            name: 'Bloqueo de menciones spam',
            enabled: true,
            eventType: discord_js_1.AutoModerationRuleEventType.MessageSend,
            triggerType: discord_js_1.AutoModerationRuleTriggerType.MentionSpam,
            triggerMetadata: {
                mentionRaidProtectionEnabled: true,
                mentionTotalLimit: 4
            },
            actions: [{
                    type: discord_js_1.AutoModerationActionType.BlockMessage,
                    metadata: {
                        customMessage: '> Tu mensaje ha sido bloqueado por contener menciones spam.',
                        durationSeconds: 30
                    }
                }]
        });
        if (!rule) {
            await (0, config_1.send)(target, 'error', 'No se pudo establecer la regla de automoderación.', true);
            return;
        }
        await (0, config_1.send)(target, 'ok', 'Se ha establecido una nueva regla de automoderación.', true);
    }
    catch (error) {
        console.error(error);
        await (0, config_1.send)(target, 'error', 'Ha ocurrido un error al establecer la regla de automoderación.', true);
    }
}
async function blacklist(target, words) {
    try {
        let has_same_rule = await target.guild?.autoModerationRules.fetch().then(rules => rules.filter(rule => rule.triggerType === discord_js_1.AutoModerationRuleTriggerType.Keyword));
        if (has_same_rule && has_same_rule?.size >= 1) {
            let rule = has_same_rule.first();
            if (rule.triggerMetadata?.keywordFilter) {
                let existing_words = rule.triggerMetadata.keywordFilter;
                words = words.filter(word => !existing_words.includes(word));
            }
            let new_keywords = rule.triggerMetadata?.keywordFilter ? [...rule.triggerMetadata.keywordFilter, ...words] : [...words];
            if (new_keywords.length <= (rule.triggerMetadata?.keywordFilter ? rule.triggerMetadata.keywordFilter.length : 0)) {
                await target.reply({
                    content: '> No se añadieron palabras puesto a que ya se encuentran dentro de la lista negra.'
                });
                return;
            }
            await rule.edit({
                triggerMetadata: {
                    keywordFilter: new_keywords
                }
            });
            await (0, config_1.send)(target, 'ok', `Se han añadido las palabras \`${words.join(', ')}\` a la lista negra existente.`, true);
            return;
        }
        let rule = await target.guild?.autoModerationRules.create({
            name: 'Lista negra personalizada',
            enabled: true,
            eventType: discord_js_1.AutoModerationRuleEventType.MessageSend,
            triggerType: discord_js_1.AutoModerationRuleTriggerType.Keyword,
            triggerMetadata: {
                keywordFilter: [...words]
            },
            actions: [{
                    type: discord_js_1.AutoModerationActionType.BlockMessage,
                    metadata: {
                        customMessage: '> Tu mensaje ha sido bloqueado por contener una palabra no permitida.'
                    }
                }]
        });
        if (!rule) {
            await (0, config_1.send)(target, 'error', 'No se pudo crear la regla de lista negra.', true);
            return;
        }
        await (0, config_1.send)(target, 'ok', `Se ha creado una nueva regla de lista negra y se han añadido las palabras \`${words.join(', ')}\`.`, true);
    }
    catch (error) {
        console.error(error);
        await (0, config_1.send)(target, 'error', 'Ha ocurrido un error al establecer la regla de lista negra.', true);
    }
}
