"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ms_1 = __importDefault(require("ms"));
async function connectDB(URI) {
    let ping = undefined;
    try {
        let cluster = await mongoose_1.default.connect(URI, {
            socketTimeoutMS: (0, ms_1.default)('10s'),
            heartbeatFrequencyMS: (0, ms_1.default)('10s'),
            serverSelectionTimeoutMS: (0, ms_1.default)('20s')
        });
        ping = await cluster.connection.db?.admin().ping();
        console.info(`[${cluster.connection.db?.databaseName}] ping a base de datos: Status`, ping);
    }
    catch (error) {
        console.error('⛔ Error crítico [BOT_DATABASE]:', error);
        process.exit(1);
    }
}
exports.default = connectDB;
