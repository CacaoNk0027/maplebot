# Maple Bot

Maple es un bot bilingüe y multifuncional para Discord. Incluye comandos de información y utilidad, moderación, acciones sociales y sistemas configurables de bienvenida y despedida.

Este repositorio contiene la distribución pública en JavaScript CommonJS generada desde el proyecto TypeScript de Maple. El código ejecutable se encuentra en [`sources/`](sources/); no necesita compilarse para desplegarlo.

## Maple 4.3.0

Esta versión consolida la arquitectura de Maple 4 y renueva sus cinco categorías de comandos:

- Experiencia completa en español (`es-ES`) e inglés (`en-US`).
- Menú `help` interactivo, bilingüe y organizado por categorías.
- Moderación con validaciones de permisos, jerarquías y objetivos dentro del servidor.
- Bienvenidas y despedidas configurables como mensaje, embed o imagen.
- Acciones con GIF aleatorio, respuestas especiales y nuevas interacciones con Maple.
- Prefijo configurable y compatibilidad con la mención al bot como prefijo.
- Menor cantidad de consultas repetidas a MongoDB y a la API de acciones.
- API web con tokens almacenados mediante hash y límites de autenticación.

Maple ofrece actualmente **53 comandos**, de los cuales **50 están activos**. `automod`, `handwash` y `read` permanecen inactivos hasta una actualización posterior.

Consulta el detalle completo en [CHANGELOG.md](CHANGELOG.md).

## Requisitos

- Node.js 20 o posterior.
- pnpm 11 mediante Corepack.
- Una aplicación de Discord.
- Acceso a MongoDB para la información de Maple y NeeKuro.
- Una credencial válida de NeeKuro.

## Instalación

Clona el repositorio e instala únicamente las dependencias de producción:

```bash
git clone https://github.com/CacaoNk0027/maplebot.git
cd maplebot
corepack enable
corepack pnpm install --prod
```

Crea el archivo de entorno a partir del ejemplo:

```bash
# Linux y macOS
cp .env.example .env
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

Completa las variables y arranca Maple:

```bash
corepack pnpm start
```

Al iniciar, la aplicación web y el bot se ejecutan dentro del mismo servicio. Maple registra también sus comandos slash globales en Discord.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `BOT_TOKEN` | Token privado de la aplicación de Discord. |
| `SESSION` | Secreto utilizado para firmar las sesiones web. |
| `URI_DBBOT` | URI de MongoDB utilizada por Maple. |
| `URI_NEEKURO` | URI de MongoDB utilizada por la API web. |
| `NEEKURO` | Credencial del cliente NeeKuro. |
| `PORT` | Puerto de la aplicación web; utiliza `449` por defecto. |
| `CORS_ORIGINS` | Orígenes web permitidos, separados por comas; es opcional. |
| `NODE_ENV` | Entorno de ejecución; usa `production` detrás del proxy del host. |

Nunca publiques `.env`, tokens, secretos de sesión ni cadenas de conexión.

## Verificación y despliegue

Comprueba la sintaxis del punto de entrada antes de iniciar:

```bash
corepack pnpm test
```

Para desplegar una actualización:

1. Conserva una copia segura de las bases de datos.
2. Instala el lockfile mediante `corepack pnpm install --prod --frozen-lockfile`.
3. Configura las variables de entorno del host.
4. Ejecuta `corepack pnpm start`.
5. Comprueba la web, el registro de comandos slash y los logs de conexión.

## Estructura pública

```text
sources/
├── bot/       # Cliente, comandos, eventos e interacciones de Discord
├── shared/    # Configuración, idiomas y modelos compartidos
└── web/       # API, vistas y recursos públicos
```

El TypeScript fuente se mantiene en el proyecto de desarrollo. Los cambios funcionales deben realizarse allí y copiarse a este repositorio mediante un build verificado.

## Comunidad

- [Invitar a Maple](https://discord.com/oauth2/authorize?client_id=821452429409124451&permissions=1477740719158&integration_type=0&scope=applications.commands+bot)
- [Servidor de soporte](https://discord.gg/E3kzS5cYzN)
- [Reportar un problema](https://github.com/CacaoNk0027/maplebot/issues)

## Licencia

Este proyecto se distribuye bajo los términos indicados en [LICENSE](LICENSE).
