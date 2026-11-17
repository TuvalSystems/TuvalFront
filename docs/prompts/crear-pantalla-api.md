# Crear una pantalla conectada al API en TUVAL

## Cómo usar esta plantilla

Envía al agente este mensaje, completando lo que conozcas:

> Usa docs/prompts/crear-pantalla-api.md. Necesito [describir lo que quiero hacer]. Lo usarán [personas o cargos, si los conozco] para [objetivo del trabajo]. Debe mostrar [información] y permitir [acciones]. Debe respetar [reglas de negocio]. Si conozco una pantalla relacionada o el API, te lo indicaré. Identifica tú dónde corresponde incorporarlo en TUVAL.

No necesitas conocer toda la respuesta del API ni los archivos internos. Investiga primero el proyecto y el API; pregunta solo por decisiones de negocio o información que no puedas obtener allí.

## Identificar la ubicación a partir de la necesidad

No pidas al usuario que identifique un módulo, carpeta, componente o ruta técnica. Interpreta su necesidad en términos del proceso de negocio: qué quiere hacer, con qué información, quién lo usa y en qué momento del trabajo.

Antes de crear una pantalla, revisa el menú, las rutas, los permisos, las pantallas relacionadas, los composables y las constantes API existentes. Determina si corresponde ampliar una pantalla actual, añadir una opción dentro de una sección existente o crear una pantalla nueva. No decidas únicamente por una palabra de la solicitud ni por el nombre del endpoint.

Si la ubicación es clara, comunica en lenguaje del usuario dónde aparecerá y por qué, y continúa sin pedir confirmación rutinaria. Ejemplo: «Lo incorporaré en Cobranzas, junto a Cobros, porque permite consultar los pagos recibidos». Sustituye este ejemplo por nombres que realmente existan en el menú inspeccionado.

Si hay dos ubicaciones razonables y la elección cambia el flujo o los permisos, formula una pregunta de negocio concreta, por ejemplo: «¿Lo usarán al vender al cliente o al revisar los cobros?». No preguntes «¿en qué módulo lo pongo?». Continúa las comprobaciones independientes mientras esperas la respuesta; no inventes reglas o permisos que dependan de ella.

La clasificación interna y la elección de archivos corresponden al agente. No crees una sección nueva del menú, dupliques una funcionalidad ni amplíes permisos solo porque la solicitud no menciona una ubicación. Si la necesidad realmente exige una sección nueva, explica esa decisión antes de implementarla.

## Instrucciones para el agente

Implementa la pantalla solicitada siguiendo estas reglas:

1. Lee las instrucciones aplicables del repositorio. Localiza una pantalla equivalente, el cliente HTTP, autenticación, constantes API, rutas, menú, permisos, componentes, composables y métodos reutilizables. Revisa si la funcionalidad ya existe y se puede extender antes de crear otra.
2. Usa la arquitectura, convenciones, nombres y estilo de código actuales. No introduzcas reingeniería, nuevas capas, dependencias, patrones ni refactorizaciones ajenas al objetivo. No escribas código que duplique un componente, método, validación o utilidad existente. Extiende recursos compartidos solo cuando sea necesario y preserva sus consumidores actuales.
3. Crea únicamente los archivos necesarios para integrar la pantalla según el patrón del módulo. Reutiliza archivos adecuados cuando existan. No generes informes, ejemplos, archivos auxiliares, copias, nuevas plantillas ni pruebas que solo repitan la implementación. No crees documentación por defecto. Si hace falta una nueva abstracción, justifica su necesidad concreta; no abstraigas para casos futuros hipotéticos.
4. Antes de definir columnas y controles, revisa el contrato y consulta el API con una sesión autorizada y operaciones de lectura. Comprueba estructura real, identificador, campos, tipos, nulos, fechas, totales, paginación, filtros, orden y errores. Relaciona cada dato de la pantalla con su campo real. No supongas que una muestra representa todos los casos ni inventes campos o capacidades del API.
5. Usa el cliente HTTP, autenticación y constantes existentes. No expongas secretos. Si falta acceso o contrato, informa lo que falta y avanza solo en lo que no dependa de ello; no presentes una simulación como integración verificada. Pruebas usa http://tuvalweb.cosenco.ec; identifica la URL del API en la configuración, no la supongas a partir de la URL del frontend.
6. Conserva estructura visual, diseño, fuente y tema de TUVAL. Usa src/components/BaseTable.vue para listados y toma como referencia src/views/cobranzas/cobros-facturas/CobrosFacturasIndex.vue. Reutiliza formularios, modales, botones, iconos y mensajes existentes. Usa colores del tema, sin valores estáticos. Sigue el patrón actual de composables para consultas, acciones y estado de tablas.
7. Implementa solo las columnas, filtros, acciones y reglas necesarias para el objetivo. Respeta la paginación y el orden soportados por el API. Incluye carga, lista vacía, errores y reintento con los mecanismos existentes. Integra ruta, menú y permisos según el proyecto, sin ampliar permisos por cuenta propia.
8. Si depende del punto de venta, utiliza el mecanismo existente para limpiar datos y selecciones anteriores, impedir respuestas atrasadas y actualizar sin recargar la página. Respeta también el contexto de usuario, cliente y bodega cuando corresponda.
9. Ejecuta las verificaciones proporcionales al cambio y los controles requeridos del proyecto. Reutiliza pruebas existentes; añade pruebas solo si cubren un riesgo o comportamiento relevante. Verifica la integración con una sesión real cuando esté disponible. No registres operaciones de negocio ni alteres datos reales solo para probar sin autorización específica.
10. Revisa el diff: elimina duplicaciones y archivos creados por tu tarea que no sean necesarios. No elimines ni reviertas trabajo ajeno. Resume la funcionalidad, los campos del API utilizados, las verificaciones y los pendientes en tu respuesta, sin generar un informe adicional. No despliegues salvo solicitud expresa.

## Estructura y legibilidad obligatorias

Antes de implementar, identifica una pantalla equivalente del mismo módulo y comunica brevemente qué archivos y recursos reutilizarás. No generes un documento adicional ni detengas el trabajo por esta revisión.

| Responsabilidad | Ubicación o recurso existente |
| --- | --- |
| Pantalla y coordinación de la interfaz | src/views/<modulo>/ y sus componentes locales |
| Consultas, acciones y estado reactivo del flujo | src/composables/<modulo>/ siguiendo los nombres reales del módulo |
| Endpoints | src/constants/apiRoutes/<modulo>/ |
| Peticiones autenticadas | src/axios.js; revisa useApiAction en src/composables/core antes de repetir su manejo de carga y errores |
| Tablas, modales y búsqueda | BaseTable.vue, BaseModal.vue, BaseSearchSelect.vue y componentes del módulo; comprueba sus props, eventos y slots antes de usarlos |
| Rutas y acceso | src/router/routes/<modulo>.js y los guards existentes |
| Alertas y formatos | src/functions/swal-alert.js y las funciones/utilidades existentes |
| Estado compartido | El store que ya use el flujo; conviven src/store y src/stores, no migres entre Vuex y Pinia por esta tarea |

Estas rutas orientan la búsqueda; no son una orden de crear un archivo o carpeta por cada responsabilidad. Conserva nombres reales como venta, ventas o cobranzas según el recurso existente. No reorganices carpetas para uniformarlos.

- Escribe funciones con una responsabilidad clara y nombres que expresen la intención. Evita abreviaturas ambiguas, bloques comprimidos en una línea, ternarios anidados y condiciones difíciles de seguir. Usa variables intermedias y retornos tempranos cuando aclaren el flujo.
- Mantén el idioma y las convenciones de nombres del módulo. No renombres APIs públicas ni archivos existentes para imponer otro estilo.
- Deja en el template la presentación y enlaces a acciones; coloca las transformaciones o reglas complejas en funciones o computed con nombres claros. Evita peticiones HTTP y reglas de negocio extensas dentro de handlers del template.
- No conviertas la vista en un archivo que concentre API, validaciones, tablas y lógica de negocio. Usa los composables y componentes adecuados sin fragmentar operaciones sencillas en archivos innecesarios.
- No copies un bloque existente para cambiar solo un endpoint, etiqueta o columna cuando un recurso actual ya admite configurarlo. Antes de ampliar un componente compartido, revisa sus consumidores y conserva compatibilidad.
- Reutiliza el manejo de carga, errores y concurrencia cuando corresponda. No añadas catch vacíos, errores silenciados, valores por defecto que oculten respuestas inválidas ni logs de depuración en la entrega.
- Mantén el formato del código circundante y las reglas ESLint del proyecto. No desactives reglas, añadas exclusiones ni rebajes verificaciones para hacer pasar el cambio. Distingue errores anteriores de los introducidos y comunica los bloqueos sin ampliar el alcance.
- Comenta decisiones o restricciones que no sean evidentes; evita comentarios que repiten literalmente el código, código comentado y tareas pendientes sin resolver.

Antes de entregar, revisa el diff y confirma en la respuesta qué recursos reutilizaste, por qué fue necesario cada archivo nuevo y qué verificaciones ejecutaste. Ejecuta npm run lint y npm run build para cambios de aplicación, además de las comprobaciones específicas pertinentes; para cambios solo de documentación revisa contenido y diff. La aprobación humana del PR sigue siendo necesaria: una plantilla orienta el trabajo, pero no garantiza por sí sola la calidad del código.

## Ramas y pull requests obligatorios

Este flujo forma parte de la tarea al invocar esta plantilla:

PR obligatorio para todas las cuentas: esta plantilla siempre exige publicar en una rama de trabajo y crear o actualizar un pull request hacia develop, incluso si se ejecuta como devtuval, josemg23 o TuvalSystems. La excepción de GitHub para esas cuentas no autoriza al agente a subir directamente a develop ni a omitir revisiones o verificaciones. No uses bypass, privilegios de administrador, cambios de protección, actualizaciones de referencias ni escrituras mediante API para eludir este flujo. No fusiones por iniciativa propia ni actives auto-merge. Si no puedes crear el PR, informa el bloqueo y conserva los cambios en la rama de trabajo; nunca recurras al push directo.

Restricción temporal: trabaja exclusivamente desde origin/develop y abre pull requests únicamente hacia develop. No crees ni redirijas PR hacia main, no prepares ramas basadas en main, no modifiques su protección ni integres develop en main. Esta restricción se mantiene hasta que el usuario autorice expresamente retomar la actualización completa de main con develop; no la levantes por iniciativa propia. Antes de publicar o actualizar un PR, verifica que su rama base sea develop.

1. Antes de editar código, revisa el estado de Git y actualiza las referencias del remoto con fetch. Crea una rama codex/<descripcion-breve> desde origin/develop actualizado. No trabajes ni hagas commits o push directamente en develop o main.
2. Conserva los cambios locales y el trabajo ajeno. Si el checkout tiene cambios de otra tarea, utiliza un worktree aislado cuando sea necesario; no los descartes, mezcles ni incluyas en el PR.
3. Implementa y valida en la rama de trabajo. Antes de publicar, vuelve a consultar origin/develop e incorpora sus cambios si la rama quedó atrasada. Sigue la estrategia del repositorio; si no existe una, integra origin/develop mediante merge en la rama de trabajo para evitar reescribir historial publicado. Resuelve conflictos conservando el comportamiento de ambas partes y repite las verificaciones afectadas.
4. Haz commits únicamente con los cambios de la tarea, publica la rama de trabajo y crea un pull request con base develop. Si ya existe un PR para esa misma tarea, actualízalo en lugar de crear otro. Incluye problema, comportamiento resultante, validación realizada y limitaciones. Entrega el enlace real del PR.
5. El PR debe mantenerse actualizado respecto de develop antes de fusionarse y tener los controles requeridos aprobados. Si develop avanza durante la revisión, actualiza la misma rama y el mismo PR, resuelve conflictos y repite las verificaciones afectadas. No fusiones el PR, no actives auto-merge y no despliegues sin solicitud expresa.
6. Si no hay acceso para publicar o crear el PR, conserva el trabajo y comunica el bloqueo exacto; nunca lo sustituyas por un push directo a develop. No afirmes que el PR existe si no se creó.

La exigencia anterior es parte del flujo del agente. Esta plantilla no configura protecciones del repositorio: no afirmes que GitHub bloquea ramas desactualizadas o pushes directos sin verificar sus reglas. No modifiques esas reglas como parte de una tarea de pantalla.

## Mejora de esta plantilla

Mantén este mismo archivo como plantilla reutilizable. Cuando el usuario indique una corrección que deba aplicarse a futuras tareas, incorpórala aquí; actualiza la otra plantilla solo si también le corresponde. No generes versiones numeradas ni copias. No conviertas una regla particular de una pantalla en una regla global. Si detectas una posible mejora sin una preferencia confirmada, propónla brevemente antes de incorporarla como requisito permanente.
