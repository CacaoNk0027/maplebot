"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class Rol {
    role;
    constructor() {
        this.role = null;
    }
    async getInfo(target, args) {
        if (target instanceof discord_js_1.ChatInputCommandInteraction) {
            let options = target.options;
            this.role = options.getRole('role');
        }
        if (target instanceof discord_js_1.Message && args) {
            let mention = target.mentions.roles.first();
            if (mention) {
                this.role = mention;
            }
            else {
                try {
                    let id = args[1] || args[0];
                    if (/^\d+$/.test(id)) {
                        this.role = await target.guild?.roles.fetch(id);
                    }
                }
                catch (error) {
                    console.warn('[Role] Rol no obtenido...');
                }
            }
        }
        if (!this.role) {
            this.role = null;
        }
        return this.role;
    }
}
exports.default = Rol;
