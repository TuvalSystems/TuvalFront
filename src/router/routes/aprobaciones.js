import LayoutBackend from "@/layouts/variations/Backend.vue";

const AprobacionesComerciales = () =>
  import("@/views/aprobaciones/ComercialesView.vue");

const AprobacionesComercialesConsulta = () =>
  import("@/views/aprobaciones/ComercialesConsultaView.vue");

const AprobacionesDevoluciones = () =>
  import("@/views/aprobaciones/devoluciones/DevolucionesView.vue");

const AprobacionesReservas = () =>
  import("@/views/aprobaciones/reservas/ReservasView.vue");

const routes = [
  {
    path: "/aprobaciones",
    component: LayoutBackend,
    meta: { requiresAuth: true },
    children: [
      {
        path: "comerciales",
        name: "aprobaciones-comerciales",
        component: AprobacionesComerciales,
        meta: {
          title: "Aprobaciones - Comerciales",
        },
      },
      {
        path: "comerciales-consulta",
        name: "aprobaciones-comerciales-consulta",
        component: AprobacionesComercialesConsulta,
        meta: {
          title: "Aprobaciones - Comerciales - Consulta",
        },
      },
      {
        path: "crediticias",
        name: "aprobaciones-crediticias",
        // component: AprobacionesCrediticias,
        component: () => import("@/views/aprobaciones/crediticia/CrediticiaIndex.vue"),

        meta: {
          title: "Aprobaciones - Crediticias",
        },
      },
      {
        path: "devoluciones",
        name: "aprobaciones-devoluciones",
        component: AprobacionesDevoluciones,
        meta: {
          title: "Aprobaciones - Devoluciones",
        },
      },
      {
        path: "reservas",
        name: "aprobaciones-reservas",
        component: AprobacionesReservas,
        meta: {
          title: "Aprobaciones - Reservas",
        },
      },
       {
        path: "devoluciones",
        name: "aprobaciones-devoluciones-consulta",
         component: () => import("@/views/aprobaciones/devoluciones/DevolucionesConsultaView.vue"),
        meta: {
          title: "Aprobaciones - Devoluciones",
        },
      },
    ],
  },
];

export default routes;
