import { RouterView } from "vue-router";
import LayoutBackend from "@/layouts/variations/Backend.vue";


const routes = [
  //** SISTEMAS */
  {
    path: "/sistemas", // Nivel 1 (ID 48)
    component: LayoutBackend,
    meta: { requiresAuth: true },
    children: [
      {
        path: "logs", // Nivel 2 (ID 49)
        name: "sistemas-logs", // Coincide con 'to' de ID 49
        // IMPORTANTE: Como es un padre, necesita un RouterView para mostrar al hijo
        component: RouterView,
        children: [
          {
            path: "sync-logs", // Nivel 3 (ID 50)
            name: "sistemas-sync-logs", // Coincide con 'to' de ID 50
            component: () => import("@/views/sistemas/logs/LogsIndex.vue"),
            meta: { title: "Logs de Sincronización" },
          },
        ],
      },
      {
        path: "movil",
        name: "sistemas-movil",
        component: RouterView,
        children: [
          {
            path: "lista-versiones",
            name: "sistemas-movil-gestion-versiones",
            component: () => import("@/views/sistemas/movil/GestionVersionesIndex.vue"),
            meta: { title: "Gestión de Versiones App" }
          }
        ],
      },
      {
        path: "Seguridad",
        name: "sistemas-seguridad",
        component: RouterView,
        children: [
          {
            path: "usuarios",
            name: "sistemas-seguridad-usuarios",
            component: () => import("@/views/sistemas/seguridad/usuarios/UsuariosIndex.vue"),
            meta: { title: "Gestión de Usuarios" }
          },
          {
            path: "perfiles",
            name: "sistemas-seguridad-perfiles",
            component: () => import("@/views/sistemas/seguridad/accesos/perfiles/ProfileIndex.vue"),
            meta: { title: "Gestión de Perfiles" }
          },
          {
            path: "secciones",
            name: "sistemas-seguridad-secciones",
            component: () => import("@/views/sistemas/seguridad/accesos/secciones/SectionIndex.vue"),
            meta: { title: "Gestión de Secciones" }
          }
        ],
      },
      {
        path: "mantenimientos",
        name: "sistemas-mantenimientos",
        component: RouterView,
        children: [
          {
            path: "lista-tipo-despachos",
            name: "sistemas-mantenimientos-tipo-despachos",
            component: () => import("@/views/sistemas/mantenimientos/tipo-despachos/TipoDespachoIndex.vue"),
            meta: { title: "Tipo Despachos" }
          },
          {
            path: "lista-proveedores",
            name: "sistemas-mantenimientos-lista-proveedores",
            component: () => import("@/views/sistemas/mantenimientos/proveedores/ProveedoresIndex.vue"),
            meta: { title: "Proveedores" }
          },
          {
            path: "lista-chofer-transportista",
            name: "sistemas-mantenimientos-lista-chofer-transportista",
            component: () => import("@/views/sistemas/mantenimientos/chofer-transportista/ChoferTransportistaIndex.vue"),
            meta: { title: "Choferes Transportistas" }
          }
        ]
      }

    ],
  },

];

export default routes;
