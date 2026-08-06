"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const hex_color_regex_1 = __importDefault(require("hex-color-regex"));
const Guild_1 = __importDefault(require("./Guild"));
const messageTypes = ['embed', 'image', 'message'];
const welcome_schema = new mongoose_1.default.Schema({
    channel: { type: String, default: null },
    messageType: { type: String, enum: messageTypes, default: 'message' },
    title: { type: String, default: null, trim: true, maxlength: 40 },
    description: { type: String, default: null, trim: true, maxlength: 60 },
    message: { type: String, default: null, trim: true, maxlength: 400 },
    background: {
        type: { type: String, enum: ['color', 'image'], default: 'color' },
        value: { type: String, default: '#1a1d1f' }
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
            const guild = await Guild_1.default.findOne({ guildId });
            if (!guild?.welcome)
                return null;
            return await this.findById(guild.welcome);
        },
        async ensureForGuild(guildId) {
            if (!guildId)
                throw new Error('Se requiere un servidor para configurar la bienvenida.');
            const session = await mongoose_1.default.startSession();
            try {
                let result;
                await session.withTransaction(async () => {
                    const guild = await Guild_1.default.findOneAndUpdate({ guildId }, { $setOnInsert: { guildId } }, { new: true, upsert: true, session });
                    if (guild.welcome) {
                        const existingWelcome = await this.findById(guild.welcome).session(session);
                        if (existingWelcome) {
                            result = existingWelcome;
                            return;
                        }
                    }
                    const welcome = new this();
                    await welcome.save({ session });
                    guild.welcome = welcome.id;
                    await guild.save({ session });
                    result = welcome;
                });
                if (!result)
                    throw new Error('No se pudo preparar la configuración de bienvenida.');
                return result;
            }
            finally {
                await session.endSession();
            }
        },
        async updateForGuild(guildId, changes) {
            const welcome = await this.ensureForGuild(guildId);
            if ('channel' in changes)
                welcome.channel = changes.channel;
            if (changes.messageType) {
                if (!messageTypes.includes(changes.messageType)) {
                    throw new Error('Tipo de mensaje de bienvenida no válido.');
                }
                welcome.messageType = changes.messageType;
            }
            if ('title' in changes)
                welcome.title = changes.title;
            if ('description' in changes)
                welcome.description = changes.description;
            if ('message' in changes)
                welcome.message = changes.message;
            if (changes.background) {
                welcome.background = {
                    type: changes.background.type || welcome.background?.type || 'color',
                    value: changes.background.value || welcome.background?.value || '#1a1d1f'
                };
            }
            if (changes.colors) {
                welcome.colors = {
                    title: changes.colors.title || welcome.colors?.title || '#FFFFFF',
                    description: changes.colors.description || welcome.colors?.description || '#99AAB5',
                    border: changes.colors.border || welcome.colors?.border || '#7289DA'
                };
            }
            await welcome.save();
            return welcome;
        },
        async setChannel(guildId, channelId) {
            return await this.updateForGuild(guildId, { channel: channelId });
        },
        async setMessageType(guildId, type) {
            return await this.updateForGuild(guildId, { messageType: type });
        },
        async setTitle(guildId, title) {
            return await this.updateForGuild(guildId, { title });
        },
        async setDescription(guildId, description) {
            return await this.updateForGuild(guildId, { description });
        },
        async setMessage(guildId, message) {
            return await this.updateForGuild(guildId, { message });
        },
        async setBackground(guildId, type, value) {
            return await this.updateForGuild(guildId, { background: { type, value } });
        },
        async setColors(guildId, colors) {
            return await this.updateForGuild(guildId, { colors });
        },
        async migrateMessageTypes(defaultType = 'message') {
            const result = await this.updateMany({ messageType: { $exists: false } }, { $set: { messageType: defaultType } });
            return result.modifiedCount;
        }
    }
});
const Welcome = mongoose_1.default.model('Welcome', welcome_schema);
exports.default = Welcome;
