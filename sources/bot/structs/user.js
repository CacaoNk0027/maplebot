"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class Usuario {
    user;
    constructor() {
        this.user = null;
    }
    async getInfo(target, args) {
        if (target instanceof discord_js_1.CommandInteraction) {
            let options = target.options;
            this.user = options.getUser('user') || target.user;
        }
        if (target instanceof discord_js_1.Message && target.reference) {
            try {
                let reply = await target.channel?.messages.fetch(target.reference.messageId);
                if (reply) {
                    this.user = reply.author;
                }
            }
            catch (error) {
                console.warn('[User] Usuario no obtenido...');
            }
        }
        else if (args && args.length > 0) {
            const message = target;
            let mention = message.mentions.users.first();
            if (mention) {
                this.user = mention;
            }
            else {
                try {
                    let id = args[1] || args[0];
                    if (/^\d+$/.test(id)) {
                        this.user = await target.client.users.fetch(id);
                    }
                }
                catch (error) {
                    console.warn('[User] Usuario no obtenido...');
                }
            }
        }
        if (!this.user) {
            this.user = target instanceof discord_js_1.Message ? target.author : target.user;
        }
        return this.user;
    }
}
exports.default = Usuario;
