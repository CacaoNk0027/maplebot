"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class Miembro {
    member;
    constructor() {
        this.member = null;
    }
    async getInfo(target, args, forceId) {
        if (target instanceof discord_js_1.ChatInputCommandInteraction) {
            let options = target.options;
            this.member = (options.getMember('user') || target.member);
        }
        if (target instanceof discord_js_1.Message && target.reference && !forceId) {
            try {
                let reply = await target.channel?.messages.fetch(target.reference.messageId);
                if (reply) {
                    this.member = reply.member;
                }
            }
            catch (error) {
                console.warn('[Member] Miembro no obtenido...');
            }
        }
        else if (args && args.length > 0) {
            const message = target;
            let mention = message.mentions.members?.first();
            if (mention && !forceId) {
                this.member = mention;
            }
            else {
                try {
                    let id = args[1] || args[0];
                    if (/^\d+$/.test(id)) {
                        this.member = await target.guild?.members.fetch(id);
                    }
                }
                catch (error) {
                    console.warn('[Member] Miembro no obtenido...');
                }
            }
        }
        if (!this.member) {
            this.member = target.member;
        }
        return this.member;
    }
}
exports.default = Miembro;
