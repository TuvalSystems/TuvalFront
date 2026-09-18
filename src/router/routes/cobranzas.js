import LayoutBackend from "@/layouts/variations/Backend.vue";

const CobranzasAprobacionDepositos = () =>
  import("@/views/cobranzas/AprobacionDepositosView.vue");
const CobranzasConsultasCobros = () =>
  import("@/views/cobranzas/ConsultasCobrosView.vue");
const LiberarOrdenDespacho = () =>
  import("@/views/cobranzas/LiberarOrdenDespacho.vue");

const routes = [
  {
    path: "/cobranzas",
    component: LayoutBackend,
    meta: { requiresAuth: true },
    children: [
     
      {
        path: "cobros-facturas",
        name: "cobranzas-cobros-facturas",
        component: () => import("@/views/cobranzas/cobros-facturas/CobrosFacturasIndex.vue"),
        meta: {
          title: "Cobros - Gestión Cobros",
        },
      },

       {
        path: "cierre-caja",
        name: "cobranzas-cierre-caja",
        component: () => import("@/views/cobranzas/cierre-caja/CierreCajaIndex.vue"),
        meta: {
          title: "Cobros - Gestión de cierre de caja",
        },
      },
      
      
      {
        path: "aprobaciondepositos",
        name: "cobranzas-aprobaciondepositos",
        component: CobranzasAprobacionDepositos,
        meta: {
          title: "Cobros - Aprobación de depósitos",
        },
      },
      {
        path: "consulta-cierre-caja",
        name: "cobranza-consulta-cierre-caja",
        component: () => import("@/views/cobranzas/consultas/CierreCajaIndex.vue"),
        meta: {
          title: "Cobros - Consultas Cierre de Caja",
        },
      },
      {
        path: "consultascobros",
        name: "cobranzas-consultascobros",
        component: CobranzasConsultasCobros,
        meta: {
          title: "Cobros - Consultas de Cobros",
        },
      },
      {
        path: "liberarordendespacho",
        name: "cobranzas-liberarordendespacho",
        component: LiberarOrdenDespacho,
        meta: {
          title: "Cobros - Liberar órdenes de despacho",
        },
      },
      {
        path: "desaplicacion-cobros",
        name: "cobranzas-desaplicacion",
        component: () => import("@/views/cobranzas/desaplicaciones/DesaplicacionIndex.vue"),
        meta: {
          title: "Cobros - Desaplicación",
        },
      },
      {
        path: "depositos-historicos",
        name: "cobranzas-depositos-historicos",
        component: () => import("@/views/cobranzas/depositos/DepositosHistoricoIndex.vue"),
        meta: {
          title: "Cobros - Depositos Historico",
        },
      },
       {
        path: "consulta-ordenes-despacho",
        name: "cobranzas-consulta-ordenes-despacho",
        component: () => import("@/views/cobranzas/ordenes-despacho/ConsultaOrdenesDespachoIndex.vue"),
        meta: {
          title: "Cobros - Consulta Ordenes de Despacho",
        },
      },
    ],
  },
];

export default routes;
