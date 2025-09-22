"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const hex_color_regex_1 = __importDefault(require("hex-color-regex"));
const Guild_1 = __importDefault(require("./Guild"));
const welcome_schema = new mongoose_1.default.Schema({
    channel: {
        type: String,
        required: true
    },
    embed: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: null,
        trim: true,
        maxlength: 40
    },
    description: {
        type: String,
        default: null,
        trim: true,
        maxlength: 60
    },
    message: {
        type: String,
        default: null,
        trim: true,
        maxlength: 400
    },
    background: {
        type: {
            type: String,
            enum: ['color', 'image'],
            default: 'color'
        },
        value: {
            type: String,
            default: '#1a1d1f'
        }
    },
    colors: {
        title: {
            type: String,
            default: '#FFFFFF',
            validate: {
                validator: (v) => (0, hex_color_regex_1.default)({ strict: true }).test(v),
                message: (prop) => `${prop.value} no es un color valido`
            }
        },
        description: {
            type: String,
            default: '#99AAB5',
            validate: {
                validator: (v) => (0, hex_color_regex_1.default)({ strict: true }).test(v),
                message: (prop) => `${prop.value} no es un color valido`
            }
        },
        border: {
            type: String,
            default: '#7289DA',
            validate: {
                validator: (v) => (0, hex_color_regex_1.default)({ strict: true }).test(v),
                message: (prop) => `${prop.value} no es un color valido`
            }
        }
    }
}, {
    statics: {
        async getByGuildId(guildId) {
            let guild = await Guild_1.default.findOne({ guildId });
            if (!guild)
                return null;
            let welcome = await this.findById(guild.welcome);
            if (!welcome)
                return null;
            return welcome;
        },
        async createForChannel(guildId) {
            let guild = await Guild_1.default.findServer(guildId);
            let new_welcome = new this();
            let created = await new_welcome.save();
            if (!guild) {
                let new_guild = new Guild_1.default({
                    guildId,
                    welcome: created.id
                });
                await new_guild.save();
            }
            else {
                guild.welcome = created.id;
                await guild.save();
            }
        }
    }
});
const Welcome = mongoose_1.default.model('Welcome', welcome_schema);
exports.default = Welcome;
