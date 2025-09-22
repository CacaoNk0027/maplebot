"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class Canal {
    channel;
    constructor() {
        this.channel = null;
    }
    async getInfo(target, args) {
        if (target instanceof discord_js_1.ChatInputCommandInteraction) {
            let options = target.options;
            this.channel = options.getChannel('channel') || target.channel;
        }
        if (target instanceof discord_js_1.Message && args) {
            let mention = target.mentions.channels.first();
            if (mention) {
                this.channel = mention;
            }
            else {
                try {
                    let id = args[1] || args[0];
                    if (/^\d+$/.test(id)) {
                        this.channel = await target.client.channels.fetch(id);
                    }
                }
                catch (error) {
                    console.warn('[Channel] Canal no obtenido...');
                }
            }
        }
        if (!this.channel) {
            this.channel = target.channel;
        }
        return this.channel;
    }
}
exports.default = Canal;
