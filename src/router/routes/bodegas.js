import LayoutBackend from "@/layouts/variations/Backend.vue";

const BodegasDashboard = () => import("@/views/bodegas/DashboardView.vue");
const DespachoPedidos = () => import("@/views/bodegas/DespachoPedidos.vue");
const RecibosDeCompraL = () => import("@/views/bodegas/RecibosDeCompraL.vue");
const Transportistasyvehiculos = () =>
  import("@/views/bodegas/Transportistasyvehiculos.vue");
const RecibosVenta = () => import("@/views/bodegas/RecibosVenta.vue");
const RecibosReposicion = () => import("@/views/bodegas/RecibosReposicion.vue");
const TransferenciasReposicion = () =>
  import("@/views/bodegas/TransferenciasReposicion.vue");
const TransferenciasReposicionBodega = () =>
  import("@/views/bodegas/TransferenciasReposicionBodega.vue");
const BodegasConsultas = () => import("@/views/bodegas/BodegasConsultas.vue");
const recibirDevolucionesIndex = () => import("@/views/bodegas/devoluciones/RecibirDevolucionesIndex.vue");

const routes = [
  {
    path: "/bodegas",
    component: LayoutBackend,
    meta: { requiresAuth: true },
    children: [

      {
        path: "dashboard",
        name: "bodegas-dashboard",
        component: BodegasDashboard,
        meta: {
          title: "Bodegas - Dashboard",
        },
      },
      {
        path: "despachopedidos",
        name: "bodegas-despachopedidos",
        component: DespachoPedidos,
        meta: {
          title: "Bodegas - Despacho de pedidos",
        },
      },
      {
        path: "recibosdecompral",
        name: "bodegas-recibosdecompral",
        component: RecibosDeCompraL,
        meta: {
          title: "Bodegas - Recibos de compra L",
        },
      },
      {
        path: "transportistasyvehiculos",
        name: "bodegas-transportistasyvehiculos",
        component: Transportistasyvehiculos,
        meta: {
          title: "Bodegas - Transportistas y Vehículos",
        },
      },

      {
        path: "transferencias/ventas/dashboard",
        name: "bodegas-transferenciasventa",
        component: () => import("@/views/bodegas/transferencia-ventas/TransferenciaVentaIndex.vue"),
        meta: {
          title: "Bodegas - Transferencias por venta",
        },
      },
      {
        path: "transferencias/ventas/detalle/:pvDestino",
        name: "bodegas-transferencias-venta-detalle",
        component: () => import("@/views/bodegas/transferencia-ventas/TransferenciaVentaDetalleBodega.vue"),
        props: true,
        meta: {
          title: "Bodegas - Transferencias por venta bodega",
          extends: "bodegas-transferenciasventa",
        },
      },
      {
        path: "recibosventa",
        name: "bodegas-recibosventa",
        component: RecibosVenta,
        meta: {
          title: "Bodegas - Recibos por venta",
        },
      },
      {
        path: "transferenciasreposicion",
        name: "bodegas-transferenciasreposicion",
        component: TransferenciasReposicion,
        meta: {
          title: "Bodegas - Transferencias por reposición",
        },
      },
      {
        path: "transferenciasreposicion/:id",
        name: "bodegas-transferenciasreposicionbodega",
        component: TransferenciasReposicionBodega,
        meta: {
          title: "Bodegas - Transferencias por reposición bodega",
          extends: "bodegas-transferenciasreposicion",

        },
      },
      {
        path: "recibosreposicion",
        name: "bodegas-recibosreposicion",
        component: RecibosReposicion,
        meta: {
          title: "Bodegas - Recibos por Reposición",
        },
      },
      {
        path: "consultas",
        name: "bodegas-consultas",
        component: BodegasConsultas,
        meta: {
          title: "Bodegas - Consultas",
        },
      },
      {
        path: "devoluciones",
        name: "bodegas-devoluciones",
        component: recibirDevolucionesIndex,
        meta: {
          title: "Bodegas - Devoluciones",
        },
      },
      {
        path: "transferencias/reservas/dashboard",
        name: "bodegas-reservas-transferencias",
        component: () => import("@/views/bodegas/reservas/TransferenciaReservaIndex.vue"),
        meta: {
          title: "Bodegas - Reservas - Transferencias",
        },
      },
      {
        path: "transferencias/reservas/detalle/:ptovtaId",
        name: "bodegas-reservas-transferencias-detalle",
        component: () => import("@/views/bodegas/reservas/TransferenciaReservaDetalleBodega.vue"),
        props: true,
        meta: {
          title: "Bodegas - Detalle Reserva",
          extends: "bodegas-reservas-transferencias",
        }
      },
      {
        path: "/bodegas/transferencias/reservas/recibir",
        name: "bodegas-reservas-transferencias-recibir",
        component: () => import("@/views/bodegas/reservas/RecibirReservasIndex.vue"),
        props: true,

      },
    ],
  },
];

export default routes;
