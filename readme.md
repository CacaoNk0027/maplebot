# Maplebot

Maplebot es un bot de Discord con una aplicación web. Este repositorio publica
la distribución en JavaScript CommonJS generada desde un proyecto TypeScript
privado. El código ejecutable está en `sources/`.

## Requisitos

- Node.js 20 o posterior
- pnpm 11
- Una aplicación de Discord y dos bases de datos MongoDB

## Instalación

```bash
corepack pnpm install --prod
Copy-Item .env.example .env
# Completa las variables de .env
corepack pnpm start
```

En Linux y macOS, usa `cp .env.example .env` en lugar de `Copy-Item`.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `BOT_TOKEN` | Token del bot de Discord. |
| `SESSION` | Secreto para firmar las sesiones web. |
| `URI_DBBOT` | URI de MongoDB usada por el bot. |
| `URI_NEEKURO` | URI de MongoDB usada por la aplicación web. |
| `NEEKURO` | Credencial del cliente Neekuro. |
| `PORT` | Puerto web; por defecto, `449`. |
| `CORS_ORIGINS` | Orígenes permitidos, separados por comas; opcional. |
| `NODE_ENV` | Entorno de ejecución, por ejemplo `production`. |

No publiques `.env` ni ninguno de sus valores.

## Verificación y despliegue

```bash
corepack pnpm test
corepack pnpm start
```

`test` comprueba la sintaxis del punto de entrada. El arranque requiere un
archivo `.env` válido y conecta con Discord y MongoDB.

Para desplegar, instala las dependencias de producción, configura las variables
de entorno en el host y ejecuta `corepack pnpm start`. No hace falta compilar:
`sources/` ya contiene la distribución lista para ejecutar.

## Desarrollo del proyecto

El TypeScript fuente no se incluye en este repositorio. Las actualizaciones se
generan en el proyecto privado y se copian aquí como una nueva versión de
`sources/`.
