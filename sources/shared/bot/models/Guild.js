"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const guild_schema = new mongoose_1.default.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    prefix: {
        type: String,
        default: ''
    },
    roles: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Rolelist'
    },
    welcome: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Welcome'
    }
}, {
    statics: {
        async findServer(guildId) {
            return this.findOne({ guildId });
        },
        async getPrefix(guildId) {
            let guild = await this.findOne({ guildId });
            if (!guild)
                return null;
            if (guild.prefix.length < 1)
                return null;
            return guild.prefix;
        },
        async setPrefix(guildId, prefix) {
            let guild = await this.findOne({ guildId });
            if (!guild) {
                let new_guild = new Guild({
                    guildId: guildId,
                    prefix: prefix
                });
                await new_guild.save();
                return;
            }
            guild.prefix = prefix;
            await guild.save();
        }
    }
});
const Guild = mongoose_1.default.model('Guild', guild_schema);
exports.default = Guild;
