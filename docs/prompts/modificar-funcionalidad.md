# Modificar una funcionalidad de TUVAL

## Cómo usar esta plantilla

Envía al agente este mensaje, completando tu necesidad:

> Usa docs/prompts/modificar-funcionalidad.md para modificar [nombre de la pantalla o función que uso, o enlace]. Actualmente [comportamiento actual] y necesito [resultado esperado]. API relacionada, si la conozco: [endpoint].

No necesitas copiar toda la plantilla ni conocer los archivos internos. Investiga primero el proyecto y pregunta solo por decisiones de negocio o información que no puedas obtener allí.

Identifica la implementación existente a partir del nombre visible, enlace o descripción del usuario. No le pidas el módulo técnico ni la carpeta. Si varias pantallas coinciden, pregunta qué opción del menú utiliza o en qué paso observa el problema. Conserva la ubicación del flujo existente salvo que el cambio solicitado requiera expresamente modificarla.

## Ejemplo para copiar y adaptar

Este ejemplo es una guía de solicitud, no una tarea pendiente que el agente deba ejecutar al leer este archivo. Sustituye la necesidad por la tuya y pega el mensaje en el chat del agente con el proyecto TUVAL abierto.

```text
Usa docs/prompts/modificar-funcionalidad.md.

En la pantalla de cotizaciones necesito agregar un filtro por vendedor.
Actualmente puedo consultar las cotizaciones, pero quiero seleccionar
un vendedor y ver únicamente las que le corresponden.

El filtro debe combinarse con los filtros existentes y tener la opción
“Todos los vendedores”. Al cambiarlo, la tabla debe volver a la primera
página. Al cambiar de punto de venta, debe limpiar la selección anterior
y cargar los vendedores correspondientes.

Conserva las columnas, acciones, permisos y diseño actuales.
Revisa si el API ya admite este filtro. Reutiliza el selector, la tabla
y los métodos existentes; no dupliques lógica ni crees archivos innecesarios.

Verifica el filtro individual, su combinación con otros filtros y el
cambio de punto de venta.

Crea una rama desde develop actualizado y entrega un PR hacia develop.
Aunque uses devtuval, josemg23 o TuvalSystems, no subas directamente
ni uses la excepción. No fusiones, no despliegues y no toques main.
```

## Dónde consultar esta guía

En GitHub, selecciona la rama develop y abre docs/prompts/modificar-funcionalidad.md. GitHub muestra el Markdown con formato y permite copiar el ejemplo. En el proyecto local, abre este mismo archivo en tu editor. Los cambios nuevos estarán disponibles en develop después de aprobar y fusionar su PR; antes puedes consultarlos en la rama del PR. Esta guía no aparece automáticamente dentro de la aplicación TUVAL.

## Instrucciones para el agente

Implementa el cambio solicitado siguiendo estas reglas:

1. Lee las instrucciones aplicables del repositorio. Revisa el flujo actual completo: pantalla, componentes, composables, métodos, estado, rutas, permisos y API. Identifica la causa y los consumidores afectados antes de editar.
2. Busca implementaciones equivalentes y recursos reutilizables. Usa los componentes, métodos, validaciones, utilidades y clientes HTTP existentes. No dupliques funcionalidad ni crees alternativas para algo que el proyecto ya resuelve.
3. Realiza el cambio mínimo necesario. Conserva arquitectura, convenciones, nombres, contratos y estilo de código del módulo. No introduzcas reingeniería, nuevas capas, dependencias, patrones o refactorizaciones ajenas al objetivo. Si un cambio estructural resulta imprescindible, explica el motivo concreto y limita su alcance.
4. Edita los archivos existentes cuando corresponda. Crea un archivo solo si la funcionalidad lo requiere, no hay uno adecuado y la separación sigue el patrón actual. No generes informes, ejemplos, archivos auxiliares, copias, nuevas plantillas ni pruebas que solo repitan la implementación. No crees documentación por defecto.
5. Conserva estructura visual, diseño, fuente y tema de TUVAL. Reutiliza componentes y colores del tema; evita colores estáticos. Para listados nuevos o cambios que requieran una tabla, usa src/components/BaseTable.vue y consulta src/views/cobranzas/cobros-facturas/CobrosFacturasIndex.vue. No migres tablas ajenas al alcance. Sigue la separación existente de consultas, acciones y estado en composables sin reorganizar todo el módulo.
6. Si depende del API, revisa el contrato y una respuesta real mediante acceso autorizado y operaciones de lectura. Verifica parámetros, campos, tipos, nulos, errores, filtros y paginación; no inventes formatos. Reutiliza autenticación y constantes API. No leas ni expongas credenciales innecesariamente. Si el acceso falta, informa el bloqueo sin presentar datos simulados como verificación real. Pruebas usa http://tuvalweb.cosenco.ec; identifica la URL del API en la configuración, no la supongas a partir de la URL del frontend.
7. Respeta permisos y reglas de negocio. Gestiona carga, errores y ausencia de resultados según los patrones existentes. Cuando dependa del punto de venta, utiliza el mecanismo actual para limpiar el contexto anterior, evitar respuestas atrasadas y actualizar sin recargar la página.
8. Ejecuta las verificaciones proporcionales al cambio y los controles requeridos del proyecto. Reutiliza pruebas existentes; añade pruebas solo si cubren un riesgo o comportamiento relevante. Verifica los flujos afectados con una sesión real cuando esté disponible. No registres operaciones de negocio ni alteres datos reales solo para probar sin autorización específica.
9. Revisa el diff: elimina duplicaciones y archivos creados por tu tarea que no sean necesarios. No elimines ni reviertas trabajo ajeno. Informa qué cambió, qué verificaste y qué quedó pendiente. No despliegues salvo solicitud expresa.

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
