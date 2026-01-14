"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const neekuro_1 = require("neekuro");
const user_1 = __importDefault(require("./user"));
const config_1 = require("../config/config");
class ActionCommand {
    target;
    args;
    action;
    user = null;
    author_messages;
    user_messages;
    bot_messages = [];
    bot_can_be_mentioned = true;
    user_required = false;
    constructor(target, data) {
        this.target = target;
        this.args = data?.args || [];
        this.action = data?.action || null;
        this.user = data?.user || null;
        this.author_messages = data?.author_messages || [];
        this.user_messages = data?.user_messages || [];
        this.bot_messages = data?.bot_messages || [];
        this.bot_can_be_mentioned = data?.bot_can_be_mentioned !== undefined ? data.bot_can_be_mentioned : true;
        this.user_required = data?.user_required !== undefined ? data.user_required : false;
    }
    set_user_required(required) {
        this.user_required = required;
        return this;
    }
    set_messages_for_bot(messages) {
        this.bot_messages = messages;
        return this;
    }
    set_bot_can_be_mentioned(canMention) {
        this.bot_can_be_mentioned = canMention;
        return this;
    }
    async add_user() {
        this.user = await new user_1.default().getInfo(this.target, this.args);
        return this;
    }
    set_messages_for_user(messages) {
        this.user_messages = messages;
        return this;
    }
    set_messages_for_author(messages) {
        this.author_messages = messages;
        return this;
    }
    getAuthor() {
        return this.target instanceof discord_js_1.Message ? this.target.author : this.target.user;
    }
    getRandomMessage(messages, author, user) {
        let arr = [];
        if (typeof messages === "function") {
            arr = user ? messages(author, user) : messages(author);
        }
        else {
            arr = messages;
        }
        if (!arr || arr.length === 0) {
            arr = [
                `**${author.globalName || author.username}** está haciendo una acción genial!`
            ];
        }
        return arr[Math.floor(Math.random() * arr.length)];
    }
    async validateUser(gif) {
        const author = this.getAuthor();
        if (!this.user) {
            if (this.user_required) {
                await this.target.reply((0, config_1.reply)('error', 'Debes mencionar a un usuario para usar este comando.'));
                return true;
            }
            else {
                await this.no_user(gif);
                return true;
            }
        }
        ;
        if (this.user.id === author.id) {
            if (this.user_required) {
                await this.target.reply((0, config_1.reply)('error', 'Debes mencionar a un usuario para usar este comando.'));
                return true;
            }
            else {
                await this.no_user(gif);
                return true;
            }
        }
        if (this.user.id === (this.target.client.user?.id)) {
            if (!this.bot_can_be_mentioned) {
                await this.target.reply((0, config_1.reply)('warn', 'Hey! No puedes usar este comando conmigo!!'));
                return true;
            }
            const bot = this.target.client.user;
            const message = this.getRandomMessage(this.bot_messages, author, bot);
            await (0, config_1.rp_embed)(this.target, message, gif);
            return true;
        }
        return false;
    }
    async execute() {
        const gif = await neekuro_1.SFW.getGif('action', this.action);
        const author = this.getAuthor();
        if (!this.user) {
            if (this.user_required) {
                await this.target.reply((0, config_1.reply)('error', 'Debes mencionar a un usuario para usar este comando.'));
                return;
            }
            else {
                await this.no_user(gif);
                return;
            }
        }
        if (await this.validateUser(gif))
            return;
        const message = this.getRandomMessage(this.user_messages, author, this.user);
        await (0, config_1.rp_embed)(this.target, message, gif);
    }
    async no_user(gif) {
        const author = this.getAuthor();
        let finalGif = gif;
        if (!finalGif && this.action) {
            finalGif = await neekuro_1.SFW.getGif('action', this.action);
        }
        const message = this.getRandomMessage(this.author_messages, author);
        await (0, config_1.rp_embed)(this.target, message, finalGif);
    }
}
exports.default = ActionCommand;
