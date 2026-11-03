"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_MODULES = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ejs_1 = __importDefault(require("ejs"));
const sessions_1 = __importDefault(require("./middlewares/sessions"));
const https_proxy_1 = __importDefault(require("./middlewares/https_proxy"));
const router_1 = __importDefault(require("./router/router"));
const sfw_1 = __importDefault(require("./api/categorias/sfw"));
const db_connect_1 = __importDefault(require("../shared/config/db_connect"));
exports.HTTP_MODULES = ['web', 'api'];
const app = (0, express_1.default)();
// La conexión se abre aquí y no al importar el módulo, para que `web/index.ts`
// valide las variables de entorno antes de tocar la base.
function main(modules) {
    (0, db_connect_1.default)(process.env.URI_NEEKURO);
    if (process.env.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
        app.use(https_proxy_1.default);
    }
    app.set('port', process.env.PORT || 449);
    app.set('json spaces', 2);
    app.use(express_1.default.urlencoded({ extended: false }));
    app.use(express_1.default.json());
    const allowedOrigins = process.env.CORS_ORIGINS
        ?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    app.use((0, cors_1.default)({
        origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : false,
        credentials: false
    }));
    // El API va antes de las sesiones: sus clientes se autentican con token y
    // no necesitan pasar por el almacén de sesiones.
    if (modules.has('api')) {
        // `/sfw` es la ruta oficial desde la 4.5.7. `/api/sfw` se conserva porque
        // la usan por defecto `neekuro` 2.3.2 y anteriores: quitarla los dejaría
        // sin GIFs. No se documenta, pero no debe retirarse antes de la 6.0.
        app.use(['/sfw', '/api/sfw'], sfw_1.default);
        // Sin la web, la raíz del dominio es la del API: en vez de un 404,
        // indica dónde están las rutas y dónde la documentación.
        if (!modules.has('web')) {
            app.get('/', (_req, res) => {
                res.status(200).json({
                    message: 'API de NeeKuro',
                    code: res.statusCode,
                    data: {
                        sfw: '/sfw',
                        docs: 'https://maplebot.fyi/api'
                    }
                });
            });
        }
    }
    if (modules.has('web')) {
        app.set('views', 'sources/web/views');
        app.set('view engine', 'ejs');
        app.engine('html', ejs_1.default.renderFile);
        (0, sessions_1.default)(app);
        app.use(router_1.default);
        app.use('/', express_1.default.static('sources/web/public'));
    }
    app.all('/*name', (req, res) => {
        res.status(404).send('Recurso no encontrado');
    });
    app.listen(app.get('port'), () => {
        console.info(`servidor HTTP arrancado (${[...modules].join(' + ')}) en el puerto ${app.get('port')}`);
    });
}
exports.default = main;
