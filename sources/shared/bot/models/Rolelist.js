"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Guild_1 = __importDefault(require("./Guild"));
const rolelist_schema = new mongoose_1.default.Schema({
    roles: {
        type: (Array),
        default: []
    }
}, {
    statics: {
        async getByGuildId(guildId) {
            let guild = await Guild_1.default.findOne({ guildId });
            if (!guild)
                return null;
            let rolelist = await this.findById(guild?.roles);
            if (!rolelist)
                return null;
            return rolelist?.roles;
        },
        async createForGuild(guildId, ...roles) {
            let guild = await Guild_1.default.findServer(guildId);
            let new_roles = new this({
                roles: roles || []
            });
            if (!guild) {
                let created = await new_roles.save();
                let new_guild = new Guild_1.default({
                    guildId,
                    roles: created.id
                });
                await new_guild.save();
            }
            else {
                let created = await new_roles.save();
                guild.roles = created.id;
                await guild.save();
            }
        },
        async addRole(guildId, ...roles) {
            let guild = await Guild_1.default.findServer(guildId);
            let new_roles = new this({
                roles: roles || []
            });
            if (!guild) {
                let created = await new_roles.save();
                let new_guild = new Guild_1.default({
                    guildId,
                    roles: created.id
                });
                await new_guild.save();
                return;
            }
            if (guild.roles) {
                this.updateOne({ _id: guild.roles }, {
                    $addToSet: {
                        roles: roles
                    }
                });
                return;
            }
            guild.roles = await (await new_roles.save()).id;
            await guild.save();
        }
    }
});
exports.default = mongoose_1.default.model('Rolelist', rolelist_schema);
