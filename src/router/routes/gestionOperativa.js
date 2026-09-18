import LayoutBackend from "@/layouts/variations/Backend.vue";


const routes = [
  // ** GESTION OPERATIVA*/
  {
    path: "/gestion-operativa",
    component: LayoutBackend,
    meta: { requiresAuth: true },
    children: [
      {
        path: "clientes-sucursales",
        name: "gestion-operativa-clientes-sucursales",
        component: () => import("@/views/gestion-operativa/clientes/ClienteSucursalesIndex.vue"),
        meta: {
          title: "Direcciones de Clientes",
        },
      }
    ]
  },

];

export default routes;
