"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class CommandData extends discord_js_1.SlashCommandBuilder {
    alias;
    id;
    category;
    inactive;
    slash;
    cooldown;
    bot_permissions;
    user_permissions;
    leveling;
    constructor() {
        super();
        this.alias = [];
        this.id = null;
        this.category = null;
        this.inactive = false;
        this.slash = true;
        this.cooldown = 3;
        this.bot_permissions = ['SendMessages', 'EmbedLinks', 'ReadMessageHistory'];
        this.user_permissions = [];
        this.leveling = false;
    }
    setAliases(...aliases) {
        this.alias = aliases;
        return this;
    }
    ignoreSlash() {
        this.slash = false;
        return this;
    }
    setId(id, category) {
        this.category = category;
        this.id = `${category}.${id}`;
        return this;
    }
    setInactive() {
        this.inactive = true;
        return this;
    }
    setCooldown(cooldown) {
        this.cooldown = cooldown;
        return this;
    }
    setBotPermissions(...permissions) {
        this.bot_permissions = [...this.bot_permissions, ...permissions];
        return this;
    }
    setUserPermissions(...permissions) {
        this.user_permissions = [...this.user_permissions, ...permissions];
        return this;
    }
    validForLeveling() {
        this.leveling = true;
        return this;
    }
}
exports.default = CommandData;
