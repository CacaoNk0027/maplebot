"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_connect_1 = __importDefault(require("../../shared/config/db_connect"));
const bot_1 = __importDefault(require("../structs/bot"));
(0, db_connect_1.default)(process.env.URI_DBBOT);
const client = new bot_1.default();
client.start();
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
