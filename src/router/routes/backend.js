import LayoutBackend from "@/layouts/variations/Backend.vue";

const BackendSincronizar = () => import("@/views/backend/SincronizarView.vue");
const BackendSincronizarCobranzas = () =>
  import("@/views/backend/SincronizarCobranzas.vue");
const BackendPerfiles = () => import("@/views/backend/PerfilesView.vue");
const BackendSecciones = () => import("@/views/backend/SeccionesView.vue");

const routes = [
  {
    path: "/backend",
    redirect: "/backend/sincronizar",
    component: LayoutBackend,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "sincronizar",
        name: "backend-sincronizar",
        component: BackendSincronizar,
        meta: {
          title: "Sincronizar",
        },
      },
      {
        path: "sincronizarcobranzas",
        name: "backend-sincronizarcobranzas",
        component: BackendSincronizarCobranzas,
        meta: {
          title: "Sincronizar Cobranzas",
        },
      },
      {
        path: "perfiles",
        name: "backend-perfiles",
        component: BackendPerfiles,
        meta: {
          title: "Perfiles",
        },
      },
      {
        path: "secciones",
        name: "backend-secciones",
        component: BackendSecciones,
        meta: {
          title: "Secciones",
        },
      },

    ],
  },
];

export default routes;
