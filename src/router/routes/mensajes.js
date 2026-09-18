import LayoutBackend from "@/layouts/variations/Backend.vue";

const Notificaciones = () => import("@/views/notificaciones/index.vue");

const routes = [
  {
    path: "/mensajes",
    component: LayoutBackend,
    meta: { requiresAuth: true },
    children: [
      {
        path: "notificaciones",
        name: "notificaciones",
        component: Notificaciones,
        meta: {
          title: "Notificaciones",
        },
      },
    ],
  },
];

export default routes;
