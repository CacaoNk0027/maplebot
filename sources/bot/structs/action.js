"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const neekuro_1 = require("neekuro");
const user_1 = __importDefault(require("./user"));
const config_1 = require("../config/config");
const Action_1 = __importDefault(require("../../shared/bot/models/Action"));
const action_easter_eggs_1 = require("./action_easter_eggs");
class ActionCommand {
    target;
    data;
    user;
    constructor(target, data) {
        this.target = target;
        this.data = data;
        this.user = data.user ?? null;
    }
    async execute() {
        let locale = 'es-ES';
        try {
            locale = await (0, config_1._locale)(this.target.guild);
            return await this.run(locale);
        }
        catch (error) {
            console.error(`[ActionCommand:${this.data.action}:ERR] No se pudo ejecutar la acción:`, error);
            await (0, config_1.send)(this.target, 'error', (0, config_1.text)(locale, 'reply.error'), true).catch(replyError => {
                console.error(`[ActionCommand:${this.data.action}:ERR] No se pudo responder el error:`, replyError);
            });
            return false;
        }
    }
    async run(locale) {
        const author = this.getAuthor();
        await this.resolveUser();
        if (!this.user || this.user.id === author.id) {
            if (this.data.targetMode === 'required') {
                await (0, config_1.send)(this.target, 'error', (0, config_1.text)(locale, 'system.005.user.required'), true);
                return false;
            }
            return await this.replyWithGif(locale, 'author', author);
        }
        if (this.user.id === this.target.client.user?.id) {
            const easterEggResult = await this.handleBotEasterEgg(locale, author);
            if (easterEggResult !== null)
                return easterEggResult;
            if (this.data.botCanBeMentioned === false) {
                await (0, config_1.send)(this.target, 'warn', (0, config_1.text)(locale, 'system.005.bot.denied'), true);
                return false;
            }
            return await this.replyWithGif(locale, 'bot', author, this.user);
        }
        const succeeded = await this.replyWithGif(locale, 'user', author, this.user);
        if (succeeded)
            await this.recordStatistics(author, this.user);
        return succeeded;
    }
    getAuthor() {
        return this.target instanceof discord_js_1.Message ? this.target.author : this.target.user;
    }
    async resolveUser() {
        if (this.data.targetMode === 'none' || this.user)
            return;
        this.user = await new user_1.default().getInfo(this.target, this.data.args);
    }
    async replyWithGif(locale, variant, author, user, customFooter) {
        const gif = await this.getGif();
        const message = this.getMessage(locale, variant, author, user);
        await (0, config_1.rp_embed)(this.target, message, gif, locale, customFooter);
        return true;
    }
    getMessage(locale, variant, author, user) {
        const key = `${this.data.messageKey}.${variant}`;
        const authorName = author.globalName ?? author.username;
        const userName = user?.globalName ?? user?.username;
        return this.getRandomLocalizedText(locale, key, [authorName, userName ?? ''], (0, config_1.text)(locale, 'system.005.message.fallback', authorName));
    }
    async handleBotEasterEgg(locale, author) {
        if (this.data.botEasterEgg === 'retaliation') {
            if (!(0, action_easter_eggs_1.registerRetaliationAttempt)(author.id, this.data.action))
                return null;
            const footer = this.getRandomLocalizedText(locale, 'system.005.easter.retaliation.footer');
            await this.replyWithGif(locale, 'retaliation', author, undefined, footer);
            return false;
        }
        if (this.data.botEasterEgg !== 'kiss')
            return null;
        const attempt = await (0, action_easter_eggs_1.registerKissAttempt)(author.id);
        if (attempt.status === 'completed') {
            await (0, config_1.send)(this.target, 'warn', (0, config_1.text)(locale, 'system.005.easter.kiss.insist'), true);
            return false;
        }
        if (attempt.count === 1)
            return null;
        if (attempt.count < action_easter_eggs_1.KISS_REQUIRED_ATTEMPTS) {
            const message = this.getRandomLocalizedText(locale, 'system.005.easter.kiss.blush');
            await (0, config_1.send)(this.target, 'warn', message, true);
            return false;
        }
        const completion = await (0, action_easter_eggs_1.completeKissEasterEgg)(author.id);
        if (!completion.awarded) {
            await (0, config_1.send)(this.target, 'warn', (0, config_1.text)(locale, 'system.005.easter.kiss.insist'), true);
            return false;
        }
        const footer = (0, config_1.text)(locale, 'system.005.easter.kiss.footer', action_easter_eggs_1.KISS_EXPERIENCE_REWARD);
        await this.replyWithGif(locale, 'special', author, undefined, footer);
        return false;
    }
    getRandomLocalizedText(locale, key, args = [], fallback = key) {
        const localized = (0, config_1.text)(locale, key);
        if (localized === key)
            return fallback;
        const choices = localized.split('||').map(message => message.trim()).filter(Boolean);
        if (!choices.length)
            return fallback;
        const template = choices[Math.floor(Math.random() * choices.length)];
        return (0, config_1.text)(locale, template, ...args);
    }
    async getGif() {
        const gif = await neekuro_1.SFW.getGif('action', this.data.action);
        if (!gif.getUrl()) {
            throw new Error(`La API no devolvió un GIF para la acción ${this.data.action}`);
        }
        return gif;
    }
    async recordStatistics(author, user) {
        if (!this.data.statistic)
            return;
        try {
            if (this.data.statistic.mode === 'pair') {
                await Action_1.default.setForUser(this.data.statistic.name, author.id, user.id);
                return;
            }
            await Action_1.default.setTotalPerAction_ToUser(this.data.statistic.name, user.id);
        }
        catch (error) {
            console.error(`[ActionCommand:${this.data.action}:WARN] No se pudo registrar la estadística:`, error);
        }
    }
}
exports.default = ActionCommand;
