# Changelog

Todos los cambios relevantes de Maple Bot se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto utiliza [versionado semántico](https://semver.org/lang/es/).

## [Sin publicar]

## [4.5.1] - 2026-10-07

### Corregido

- Las vistas y las hojas de estilo pedían el CSS, el JS y las imágenes al dominio anterior, que dejó de resolver, y esas páginas quedaban sin estilos. Ahora usan rutas desde la raíz, así que funcionan con cualquier dominio.
- El bot fija la URL del API de GIFs al arrancar, configurable con `NEEKURO_API`. Antes la tomaba del valor por defecto del paquete `neekuro`, de modo que un cambio de dominio exigía publicar una versión nueva de la librería.
- Se retira de la dashboard el enlace a una hoja de estilos que ya no existe.

## [4.5.0] - 2026-10-06

### Añadido

- Sistema de registros configurable evento por evento: mensajes borrados, editados y purgados, entradas y salidas, bienvenidas y despedidas, y toda la actividad de AutoMod. Cada tipo se activa por separado y puede enviarse a su propio canal o a uno común.
- Panel de registros con menús y botones en `logs`, en lugar de subcomandos. La configuración anterior de AutoMod se traslada sola la primera vez que se lee.
- Categoría de comandos de reacción con veintiún comandos: un GIF distinto cada vez para responder sin escribir. Ninguna reacción puede dirigirse al bot.
- Comandos `kick` y `warn`. Ambos quedan en el historial de infracciones y los avisos suman para el escalado por reincidencia, que se evalúa en el acto. `warn retirar` borra el aviso más reciente.
- Comando `embed` con constructor interactivo: título, descripción, color, imágenes y vista previa antes de enviar.
- Comandos `color` y `roleinfo` en utilidades.
- Acciones `explosion`, `handhold`, `highfive` y `wave`.
- Comando `features` en información, que resume lo que trae la versión.
- Aviso de nueva versión, mostrado una sola vez por servidor al primer comando tras la actualización. Se puede desactivar con `features avisos off`, que requiere Gestionar servidor.
- Rotación diaria de la frase de presencia, programada para cada medianoche en lugar de un intervalo fijo, de modo que no deriva con los reinicios ni con el horario de verano.

### Cambiado

- La acción `read` queda activa, ya con GIF disponibles en la API.
- Los emojis personalizados se centralizan en un catálogo tipado, en lugar de repetir los identificadores por cinco archivos.
- La caché de mensajes se acota a doscientos por canal con limpieza cada treinta minutos, necesaria para que los registros de borrado y edición conserven el texto sin que la memoria crezca sin límite.
- El compilado se construye en un directorio temporal y se intercambia de golpe, así que un build fallido deja el despliegue anterior intacto.

### Eliminado

- Acción `handwash`, descontinuada. Su categoría permanece en la API.

### Corregido

- El panel de registros no podía guardar ningún ajuste: las claves de evento llevan un punto y Mongoose no lo admite en las claves de un mapa. Los guardados que abren una transacción confirman la interacción antes de escribir, para no agotar el plazo de tres segundos de Discord.
- Enviar un embed desde el panel fallaba indicando que el canal no existía.
- El interruptor de avisos solo respondía a `features off`, y no a la forma larga que el propio mensaje indicaba.
- La presencia del bot se perdía cuando Discord invalidaba la sesión; ahora se repone al reconectar.

### Seguridad

- Cinco avisos de dependencias cerrados, uno de ellos crítico: `proxy-addr` actualizado a `2.0.8` ([GHSA-9j49-pjc9-vhv5](https://github.com/advisories/GHSA-9j49-pjc9-vhv5), suplantación de IP mediante direcciones IPv4 asignadas en IPv6, que afectaba directamente a la configuración de `trust proxy`), junto a `undici` `6.28.1`, `brace-expansion` `2.1.7`, `ip-address` `10.7.1` y `moment` `2.31.0`. La auditoría de producción no reporta vulnerabilidades conocidas.
- Las infracciones manuales siguen la misma regla de privacidad que las automáticas: se guarda el motivo, nunca el contenido del mensaje.
- Maple no envía mensajes directos en ninguna sanción; el aviso llega mencionando al usuario en el canal.

## [4.4.1] - 2026-09-15

### Cambiado

- Las categorías de GIF que acepta la API se toman directamente del esquema de la base, en lugar de una lista mantenida aparte.
- Las rutas de reacción de la API validan la categoría y cachean el catálogo cinco minutos, igual que las de acción.

### Corregido

- El inicio de sesión en la web respondía como exitoso pero no daba acceso a la dashboard: el proxy del host no indica que la conexión es HTTPS y la cookie de sesión se descartaba.
- Cerrar sesión no borraba la cookie del navegador.
- Eliminar la cuenta desde la dashboard llamaba a una ruta inexistente. Ahora pide la contraseña, borra el token invalidándolo en el acto y cierra la sesión; las sesiones abiertas en otros dispositivos se cierran en su siguiente acceso.
- Las categorías de acción `read`, `wave`, `highfive` y `handhold` respondían 404 en la API pese a tener GIF cargados.
- Consultar una categoría de reacción inexistente, como `_id`, devolvía datos internos del documento en lugar de un 404.

### Seguridad

- Dependencia transitiva `qs` actualizada de `6.15.2` a `6.16.0`. La versión fijada anteriormente estaba afectada por dos avisos de denegación de servicio ([GHSA-x5fp-wj9c-mxmx](https://github.com/advisories/GHSA-x5fp-wj9c-mxmx) y [GHSA-4mjr-xmp4-gh2g](https://github.com/advisories/GHSA-4mjr-xmp4-gh2g)). La auditoría de producción no reporta vulnerabilidades conocidas.

### Inactivo

- `handwash` y `read`: pendientes en el bot. `read` ya dispone de GIF en la API; `handwash` todavía no.

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

[Sin publicar]: https://github.com/CacaoNk0027/maplebot/compare/v4.5.0...HEAD
[4.5.0]: https://github.com/CacaoNk0027/maplebot/compare/v4.4.1...v4.5.0
[4.4.1]: https://github.com/CacaoNk0027/maplebot/compare/v4.4.0...v4.4.1
[4.4.0]: https://github.com/CacaoNk0027/maplebot/compare/v4.3.0...v4.4.0
[4.3.0]: https://github.com/CacaoNk0027/maplebot/compare/v4.2.2...v4.3.0
