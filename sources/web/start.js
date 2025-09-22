"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ejs_1 = __importDefault(require("ejs"));
const sessions_1 = __importDefault(require("./middlewares/sessions"));
const router_1 = __importDefault(require("./router/router"));
const db_connect_1 = __importDefault(require("../shared/config/db_connect"));
(0, db_connect_1.default)(process.env.URI_NEEKURO);
const app = (0, express_1.default)();
function main() {
    app.set('port', process.env.PORT || 449);
    app.set('json spaces', 2);
    app.set('views', 'sources/web/views');
    app.set('view engine', 'ejs');
    app.engine('html', ejs_1.default.renderFile);
    app.use(express_1.default.urlencoded({ extended: false }));
    app.use(express_1.default.json());
    app.use((0, cors_1.default)());
    (0, sessions_1.default)(app);
    app.use(router_1.default);
    app.use('/', express_1.default.static('sources/web/public'));
    app.get('*', (req, res) => {
        res.status(404).send('recurso no encontrado');
    });
    app.listen(app.get('port'), () => {
        console.info('servidor web arrancado');
    });
}
exports.default = main;
