import LayoutBackend from "@/layouts/variations/Backend.vue";

const VentasCrearCotizacion = () =>
  import("@/views/ventas/cotizaciones/crear-cotizacion/CrearCotizacionView.vue");
const VentasCotizacionProspecto = () =>
  import("@/views/ventas/cotizaciones/CotizacionProspectoView.vue");
const VentasCotizaciones = () =>
  import("@/views/ventas/cotizaciones/CotizacionesView.vue");
const VentasPedidos = () => import("@/views/ventas/pedidos/PedidosView.vue");
const ventaPedidosReservas = () => import("@/views/ventas/pedidos/PedidosReservasIndex.vue");
const VentasReservas = () =>
  import("@/views/ventas/reservas/ReservasIndex.vue");
const VentasConsultas = () => import("@/views/ventas/ConsultasView.vue");
const VentasCrearCliente = () =>
  import("@/views/ventas/cliente/CrearClienteView.vue");

const routes = [
  {
    path: "/ventas",
    component: LayoutBackend,
    meta: { requiresAuth: true },
    children: [
      {
        path: "crearcotizacion",
        name: "ventas-crearcotizacion",
        component: VentasCrearCotizacion,
        meta: {
          title: "Ventas - Crear cotización",
        },
      },
      {
        path: "cotizaciones/desde-imagenes",
        name: "ventas-cotizacion-imagenes",
        component: () => import("@/views/ventas/cotizaciones/CotizacionImagenesView.vue"),
        meta: {
          title: "Ventas - Cotización desde imágenes",
          extends: "ventas-crearcotizacion",
        },
      },
      {
        path: "cotizacionprospecto",
        name: "ventas-cotizacionprospecto",
        component: VentasCotizacionProspecto,
        meta: {
          title: "Ventas - Cotización Prospecto",
        },
      },
      {
        path: "crearcliente",
        name: "ventas-crearcliente",
        component: VentasCrearCliente,
        meta: {
          title: "Ventas - Crear cliente",
        },
      },
      {
        path: "cotizaciones",
        name: "ventas-cotizaciones",
        component: VentasCotizaciones,
        meta: {
          title: "Ventas - Cotizaciones",
        },
      },
      {
        path: "pedidos",
        name: "ventas-pedidos",
        component: VentasPedidos,
        meta: {
          title: "Ventas - Pedidos",
        },
      },
      {
        path: "pedidos-consulta",
        name: "ventas-pedidos-consulta",
        component: () => import("@/views/ventas/pedidos/consulta/PedidosViewConsulta.vue"),
        meta: {
          title: "Ventas - Pedidos",
        },
      },
      {
        path: "pedidos-reservas",
        name: "ventas-pedidos-reservas",
        component: ventaPedidosReservas,
        meta: {
          title: "Ventas - Pedidos- Reservas",
        },
      },

      {
        path: "reservas",
        name: "ventas-reservas",
        component: VentasReservas,
        meta: {
          title: "Ventas - Reservas",
        },
      },
      {
        path: "consultas",
        name: "ventas-consultas",
        component: VentasConsultas,
        meta: {
          title: "Ventas - Consultas",
        },
      },
    ],
  },
];

export default routes;
