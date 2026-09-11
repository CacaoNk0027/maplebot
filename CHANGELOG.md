# Changelog

Todos los cambios relevantes de Maple Bot se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto utiliza [versionado semántico](https://semver.org/lang/es/).

## [Sin publicar]

### Seguridad

- Dependencia transitiva `qs` actualizada de `6.15.2` a `6.16.0`. La versión fijada anteriormente estaba afectada por dos avisos de denegación de servicio ([GHSA-x5fp-wj9c-mxmx](https://github.com/advisories/GHSA-x5fp-wj9c-mxmx) y [GHSA-4mjr-xmp4-gh2g](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g)). La auditoría de producción no reporta vulnerabilidades conocidas.

## [4.4.0] - 2026-09-11

### Añadido

- Sistema de automoderación completo: `automod` cubre los cinco disparadores de Discord (palabras personalizadas, expresiones regulares, listas predefinidas, spam general, spam de menciones y perfil de miembro).
- Creación de reglas con vista previa y confirmación, que revalida permisos, conflictos de nombre y existencia de canales y roles antes de aplicar.
- Edición de reglas campo por campo mediante un menú de selección y formularios precargados con el valor actual, con menús de roles y canales en lugar de listas de identificadores.
- Registro de la actividad de AutoMod en un canal configurable: mensajes bloqueados y altas, cambios y bajas de reglas, con el responsable obtenido del registro de auditoría.
- Comando `logs` para elegir el canal y activar cada tipo de registro por separado.
- Historial de infracciones por usuario y resumen del servidor mediante el comando `infractions`, con navegación por páginas.
- Sanciones automáticas por reincidencia configurables con el comando `escalation`: escalera de avisos y aislamientos, ventana de reincidencia ajustable y desactivadas por defecto.
- Comando `ban` con baneo, softban para purgar mensajes sin expulsión permanente, baneo por identificador sobre cuentas ausentes y retirada de baneo.

### Cambiado

- `automod` deja de estar inactivo y pasa a ser un sistema completo.
- Las sanciones manuales quedan registradas en el historial junto a las automáticas, distinguidas por origen.
- Los comandos de barra se registran únicamente desde el primer shard, en lugar de una vez por proceso.
- Página principal actualizada para presentar Maple 4.4.0.

### Eliminado

- Categoría de comandos privados del servidor de soporte, que pasa a atenderse con un bot independiente.

### Seguridad

- Las infracciones almacenan solo la coincidencia detectada, nunca el contenido completo del mensaje, y se eliminan solas a los noventa días.
- El escalado automático se limita a sanciones reversibles: avisos y aislamientos, nunca expulsión ni baneo.
- La edición de reglas revalida los permisos al enviarse el formulario y no solo al abrirlo.

### Inactivo

- `handwash` y `read`: sin una categoría de GIF válida disponible actualmente en la API.

## [4.3.0] - 2026-08-28

### Añadido

- Idiomas configurables por servidor: español (`es-ES`) e inglés (`en-US`).
- Traducciones para los comandos, menús, modales, validaciones y mensajes del bot.
- Comando `language` para consultar o cambiar el idioma del servidor.
- Mención a Maple como alternativa al prefijo configurado.
- Nuevo núcleo compartido para moderación, aislamientos y bloqueo de canales.
- Menú de ayuda bilingüe con categorías y detalles de cada comando.
- Respuestas especiales al realizar repetidamente determinadas acciones contra Maple.
- Evento especial al intentar besar a Maple y recompensa única de experiencia.
- Posibilidad de jugar con Maple mediante el comando `play`.
- Catálogo validado de acciones compatibles con la API NeeKuro.

### Cambiado

- Refactorización completa de las categorías de utilidades, configuración y acciones.
- Refactorización de los siete comandos activos de moderación como un solo sistema.
- Bienvenidas y despedidas reorganizadas alrededor de una infraestructura compartida.
- Generación de imágenes de bienvenida y despedida centrada vertical y horizontalmente.
- Acciones sociales servidas con un GIF aleatorio en cada llamada.
- Cachés y consultas de MongoDB optimizados para reducir el consumo del plan gratuito.
- API de acciones optimizada para consultar únicamente la categoría solicitada.
- Página principal actualizada para presentar Maple 4.3.0.
- NeeKuro actualizado a `^2.2.0`.

### Corregido

- Errores inesperados ahora muestran una respuesta genérica localizada y conservan el detalle en consola.
- `help` ya no produce errores al consultar comandos mediante prefijo y recupera la cuadrícula de tres comandos por fila.
- `say` tolera que otra instancia haya eliminado previamente el mensaje original.
- `mute` no reemplaza la duración de un aislamiento que ya está activo.
- `unmute` no anuncia éxito después de una operación fallida.
- `unlock` restaura la herencia de permisos en lugar de forzar `SendMessages: true`.
- `lock`, `addrol` y `removerol` validan correctamente jerarquías, permisos y pertenencia al servidor.
- `purgue` utiliza cantidades enteras, maneja mensajes antiguos y evita incluir su propia respuesta slash.
- Resolución de miembros, roles y canales limitada al servidor donde se ejecuta el comando.
- Textos globales de permisos, NSFW y cooldown traducidos.
- Configuración de `trust proxy` corregida para hosts detrás de proxy.
- Generación de tokens web corregida para evitar documentos con `token: null`.

### Seguridad

- Los tokens nuevos de la API se almacenan mediante hash SHA-256 y solo se muestran una vez.
- Se añadieron límites de intentos a autenticación y generación de tokens.
- CORS queda cerrado por defecto y puede habilitarse mediante `CORS_ORIGINS`.
- Dependencia transitiva `brace-expansion` fijada en `2.1.4`; la auditoría de producción no reporta vulnerabilidades conocidas.

### Inactivo

- `automod`: reservado para una actualización posterior del sistema de automoderación.
- `handwash` y `read`: sin una categoría de GIF válida disponible actualmente en la API.

[Sin publicar]: https://github.com/CacaoNk0027/maplebot/compare/v4.4.0...HEAD
[4.4.0]: https://github.com/CacaoNk0027/maplebot/compare/v4.3.0...v4.4.0
[4.3.0]: https://github.com/CacaoNk0027/maplebot/compare/v4.2.2...v4.3.0
