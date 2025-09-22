"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const express_session_1 = __importDefault(require("express-session"));
const ms_1 = __importDefault(require("ms"));
function sessions(app) {
    app.use((0, express_session_1.default)({
        secret: process.env['SESSION'],
        resave: false,
        saveUninitialized: false,
        store: connect_mongo_1.default.create({
            mongoUrl: process.env['URI_DBNEEKURO'],
            collectionName: "websessions"
        }),
        cookie: {
            maxAge: (0, ms_1.default)('2h')
        }
    }));
}
exports.default = sessions;
