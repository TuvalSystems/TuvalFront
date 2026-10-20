import LayoutBackend from "@/layouts/variations/Backend.vue";

const DevolucionesPedidos = () =>
  import("@/views/devoluciones/DevolucionesPedidos.vue");

const routes = [
  {
    path: "/devoluciones",
    component: LayoutBackend,
    meta: { requiresAuth: true },
    children: [
      {
        path: "pedidos",
        name: "devoluciones-pedidos",
        component: DevolucionesPedidos,
        meta: {
          title: "Devoluciones - Pedidos",
        },
      },
    ],
  },
];

export default routes;
