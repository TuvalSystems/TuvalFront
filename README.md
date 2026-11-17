# Vue 3 + Vite

## Solicitar cambios en TUVAL

Usa estas guías para pedir una funcionalidad al agente con el proyecto TUVAL abierto:

- [Crear una funcionalidad o pantalla conectada al API](docs/prompts/crear-pantalla-api.md)
- [Modificar una funcionalidad existente](docs/prompts/modificar-funcionalidad.md)

Abre la guía correspondiente, copia el bloque de **Ejemplo para copiar y adaptar**, reemplaza la necesidad por la tuya y pégalo en el chat del agente. Explica qué quieres hacer, qué información necesitas y qué resultado esperas. No necesitas conocer módulos, carpetas ni endpoints: el agente revisará el proyecto y localizará la implementación adecuada.

Las guías exigen conservar el diseño y la estructura de TUVAL, reutilizar componentes y métodos y entregar los cambios mediante un pull request hacia `develop`. Esto también aplica a `devtuval`, `josemg23` y `TuvalSystems`: el agente no debe usar sus excepciones para subir directamente, fusionar automáticamente ni trabajar sobre `main`.

Los enlaces abren los archivos de la rama que estés consultando en GitHub. Para usar la versión integrada, selecciona `develop`; para revisar cambios pendientes, abre la rama del PR. Estas guías pertenecen al repositorio y no aparecen dentro de la aplicación TUVAL.

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)
