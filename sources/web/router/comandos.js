"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandTotal = commandTotal;
exports.slugify = slugify;
exports.renderCommands = renderCommands;
const fs_1 = __importDefault(require("fs"));
// Documentación de comandos (fase 6 del plan 5.0.0). Los datos los genera el
// build en sources/web/data/comandos.json (scripts/command-docs.cjs) a partir
// de los comandos compilados; aquí solo se leen y se pintan. /comandos es la
// versión en español y /commands la inglesa.
const DATA_PATH = 'sources/web/data/comandos.json';
// Se lee una vez: el archivo solo cambia con un despliegue, que reinicia el proceso.
let cache;
function loadDocs() {
    if (cache !== undefined)
        return cache;
    try {
        cache = JSON.parse(fs_1.default.readFileSync(DATA_PATH, 'utf8'));
    }
    catch (error) {
        console.error('[web:comandos] No se pudo leer la documentación de comandos:', error);
        cache = null;
    }
    return cache;
}
// Para la portada: el total real de comandos, o null si el JSON no está.
function commandTotal() {
    return loadDocs()?.total ?? null;
}
const PERMISSIONS = {
    Administrator: { es: 'Administrador', en: 'Administrator' },
    AttachFiles: { es: 'Adjuntar archivos', en: 'Attach Files' },
    BanMembers: { es: 'Banear miembros', en: 'Ban Members' },
    EmbedLinks: { es: 'Insertar enlaces', en: 'Embed Links' },
    KickMembers: { es: 'Expulsar miembros', en: 'Kick Members' },
    ManageChannels: { es: 'Gestionar canales', en: 'Manage Channels' },
    ManageGuild: { es: 'Gestionar servidor', en: 'Manage Server' },
    ManageMessages: { es: 'Gestionar mensajes', en: 'Manage Messages' },
    ManageRoles: { es: 'Gestionar roles', en: 'Manage Roles' },
    ModerateMembers: { es: 'Aislar temporalmente a miembros', en: 'Timeout Members' },
    ReadMessageHistory: { es: 'Leer el historial de mensajes', en: 'Read Message History' },
    SendMessages: { es: 'Enviar mensajes', en: 'Send Messages' },
    ViewAuditLog: { es: 'Ver el registro de auditoría', en: 'View Audit Log' }
};
const OPTION_TYPES = {
    subcomando: { es: 'subcomando', en: 'subcommand' },
    grupo: { es: 'grupo', en: 'group' },
    texto: { es: 'texto', en: 'text' },
    entero: { es: 'número entero', en: 'integer' },
    booleano: { es: 'sí o no', en: 'true or false' },
    usuario: { es: 'usuario', en: 'user' },
    canal: { es: 'canal', en: 'channel' },
    rol: { es: 'rol', en: 'role' },
    mencionable: { es: 'usuario o rol', en: 'user or role' },
    'número': { es: 'número', en: 'number' },
    archivo: { es: 'archivo', en: 'file' }
};
const STRINGS = {
    es: {
        htmlLang: 'es',
        title: 'Comandos de Maple',
        description: 'Todos los comandos de Maple, con sus opciones y los permisos que piden.',
        skip: 'Saltar al contenido',
        openMenu: 'Abrir menú',
        closeMenu: 'Cerrar menú',
        home: 'Inicio',
        support: 'Soporte',
        backHome: 'Volver a Maple',
        eyebrow: 'Documentación',
        lead: (total, prefix) => `Maple tiene ${total} comandos. Todos funcionan con el prefijo ${prefix}, o con el que haya elegido tu servidor, y los marcados «Barra y prefijo» también escribiendo /.`,
        categories: 'Categorías',
        allCommands: 'Todos los comandos',
        categoryParam: 'categoria',
        searchLabel: 'Buscar un comando',
        searchPlaceholder: 'Nombre o alias, por ejemplo «ban»…',
        noResults: 'Ningún comando coincide con esa búsqueda.',
        commands: (n) => n === 1 ? '1 comando' : `${n} comandos`,
        slashAndPrefix: 'Barra y prefijo',
        prefixOnly: 'Solo prefijo',
        inactive: 'En pausa',
        aliases: 'Alias',
        cooldown: 'Espera entre usos',
        seconds: (n) => `${n} s`,
        userPermissions: 'Necesitas',
        botPermissions: 'Maple necesita',
        options: 'Opciones',
        subcommands: 'Subcomandos',
        noOptions: 'Sin opciones.',
        required: 'obligatoria',
        optional: 'opcional',
        values: 'Valores',
        range: (min, max) => min !== undefined && max !== undefined ? `de ${min} a ${max}` : min !== undefined ? `desde ${min}` : `hasta ${max}`,
        length: (min, max) => min !== undefined && max !== undefined ? `de ${min} a ${max} caracteres` : min !== undefined ? `al menos ${min} caracteres` : `hasta ${max} caracteres`,
        unavailable: 'La documentación de comandos no está disponible ahora mismo. Mientras tanto, escribe /help en Discord.',
        otherLang: 'English',
        otherLangLabel: 'Read this page in English',
        footer: 'Una compañera para tu comunidad de Discord.',
        privacy: 'Privacidad',
        terms: 'Términos',
        version: (v) => `Generada de la versión ${v}.`
    },
    en: {
        htmlLang: 'en',
        title: 'Maple commands',
        description: "All of Maple's commands, with their options and the permissions they need.",
        skip: 'Skip to content',
        openMenu: 'Open menu',
        closeMenu: 'Close menu',
        home: 'Home',
        support: 'Support',
        backHome: 'Back to Maple',
        eyebrow: 'Documentation',
        lead: (total, prefix) => `Maple has ${total} commands. All of them work with the ${prefix} prefix, or the one your server chose, and the ones marked "Slash and prefix" also by typing /.`,
        categories: 'Categories',
        allCommands: 'All commands',
        categoryParam: 'category',
        searchLabel: 'Search for a command',
        searchPlaceholder: 'Name or alias, for example “ban”…',
        noResults: 'No command matches that search.',
        commands: (n) => n === 1 ? '1 command' : `${n} commands`,
        slashAndPrefix: 'Slash and prefix',
        prefixOnly: 'Prefix only',
        inactive: 'Paused',
        aliases: 'Aliases',
        cooldown: 'Cooldown',
        seconds: (n) => `${n} s`,
        userPermissions: 'You need',
        botPermissions: 'Maple needs',
        options: 'Options',
        subcommands: 'Subcommands',
        noOptions: 'No options.',
        required: 'required',
        optional: 'optional',
        values: 'Values',
        range: (min, max) => min !== undefined && max !== undefined ? `from ${min} to ${max}` : min !== undefined ? `from ${min}` : `up to ${max}`,
        length: (min, max) => min !== undefined && max !== undefined ? `${min} to ${max} characters` : min !== undefined ? `at least ${min} characters` : `up to ${max} characters`,
        unavailable: 'The command documentation is not available right now. In the meantime, type /help in Discord.',
        otherLang: 'Español',
        otherLangLabel: 'Lee esta página en español',
        footer: 'A companion for your Discord community.',
        privacy: 'Privacy',
        terms: 'Terms',
        version: (v) => `Generated from version ${v}.`
    }
};
// Nombre de categoría a URL: «Configuración» → «configuracion».
function slugify(text) {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
const PATHS = { es: '/comandos', en: '/commands' };
// El filtro por categoría es un parámetro de la URL que resuelve el servidor:
// funciona sin JavaScript, se puede compartir y respeta atrás y adelante.
function renderCommands(lang) {
    const other = lang === 'es' ? 'en' : 'es';
    return (req, res) => {
        const docs = loadDocs();
        const t = STRINGS[lang];
        const wanted = typeof req.query[t.categoryParam] === 'string' ? req.query[t.categoryParam] : '';
        const selected = docs?.categorias.find(category => slugify(category.nombre[lang]) === wanted) ?? null;
        const link = (target, category) => {
            if (!category)
                return PATHS[target];
            return `${PATHS[target]}?${STRINGS[target].categoryParam}=${slugify(category.nombre[target])}`;
        };
        res.render('comandos.html', {
            lang,
            docs,
            t,
            selected,
            shown: docs ? (selected ? [selected] : docs.categorias) : [],
            nav: docs ? [
                { name: t.allCommands, count: docs.total, href: link(lang, null), active: !selected },
                ...docs.categorias.map(category => ({
                    name: category.nombre[lang],
                    count: category.comandos.length,
                    href: link(lang, category),
                    active: category === selected
                }))
            ] : [],
            otherHref: link(other, selected),
            permission: (name) => PERMISSIONS[name]?.[lang] ?? name,
            optionType: (type) => OPTION_TYPES[type]?.[lang] ?? type
        });
    };
}
