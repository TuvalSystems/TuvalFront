import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
  RouterView,
} from "vue-router";

import NProgress from "nprogress/nprogress.js";

// Main layout variations
import LayoutBackend from "@/layouts/variations/Backend.vue";

// Backend: Administrascion
const BackendSincronizar = () => import("@/views/backend/SincronizarView.vue");
const BackendSincronizarCobranzas = () =>
  import("@/views/backend/SincronizarCobranzas.vue");
const BackendPerfiles = () => import("@/views/backend/PerfilesView.vue");
const BackendSecciones = () => import("@/views/backend/SeccionesView.vue");

// Ventas: Cotizaciones
const VentasCrearCotizacion = () =>
  import("@/views/ventas/cotizaciones/CrearCotizacionView.vue");
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
  import("@/views/ventas/cotizaciones/CrearClienteView.vue");

// Cobranzas: cobroFacturas
const CobranzasFacturas = () =>
  import("@/views/cobranzas/CobranzasFacturasView.vue");
const CobranzasPedido = () =>
  import("@/views/cobranzas/CobranzasPedidoView.vue");
const CobranzasAprobacionDepositos = () =>
  import("@/views/cobranzas/AprobacionDepositosView.vue");
const CobranzasCierredecaja = () =>
  import("@/views/cobranzas/CierredecajaView.vue");
const CobranzasConsultasCobros = () =>
  import("@/views/cobranzas/ConsultasCobrosView.vue");
const LiberarOrdenDespacho = () =>
  import("@/views/cobranzas/LiberarOrdenDespacho.vue");

// Aprobaciones: comerciales

const AprobacionesComerciales = () =>
  import("@/views/aprobaciones/ComercialesView.vue");

const AprobacionesComercialesConsulta = () =>
  import("@/views/aprobaciones/ComercialesConsultaView.vue");
const AprobacionesCrediticias = () =>
  import("@/views/aprobaciones/CrediticiasView.vue");

const AprobacionesDevoluciones = () =>
  import("@/views/aprobaciones/DevolucionesView.vue");

const AprobacionesReservas = () =>
  import("@/views/aprobaciones/ReservasView.vue");
// Devoluciones

const DevolucionesPedidos = () =>
  import("@/views/devoluciones/DevolucionesPedidos.vue");

// Bodegas: Despachos
const BodegasDashboard = () => import("@/views/bodegas/DashboardView.vue");
const DespachoPedidos = () => import("@/views/bodegas/DespachoPedidos.vue");
const RecibosDeCompraL = () => import("@/views/bodegas/RecibosDeCompraL.vue");
const Transportistasyvehiculos = () =>
  import("@/views/bodegas/Transportistasyvehiculos.vue");
const TransferenciasVenta = () =>
  import("@/views/bodegas/TransferenciasVenta.vue");
const TransferenciasVentaBodega = () =>
  import("@/views/bodegas/TransferenciasVentaBodega.vue");
const RecibosVenta = () => import("@/views/bodegas/RecibosVenta.vue");
const RecibosReposicion = () => import("@/views/bodegas/RecibosReposicion.vue");
const TransferenciasReposicion = () =>
  import("@/views/bodegas/TransferenciasReposicion.vue");
const TransferenciasReposicionBodega = () =>
  import("@/views/bodegas/TransferenciasReposicionBodega.vue");
const BodegasConsultas = () => import("@/views/bodegas/BodegasConsultas.vue");

const DevolucionesBodegas = () =>
  import("@/views/bodegas/DevolucionesBodegas.vue");

const Notificaciones = () => import("@/views/notificaciones/index.vue");
const PasswordChange = () => import("@/views/auth/PasswordChange.vue");

/** devoluciones bodegas index */

const recibirDevolucionesIndex = () => import("@/views/bodegas/devoluciones/RecibirDevolucionesIndex.vue");

/** bodegas reservas */
const TransferenciaReservaIndex = () =>
  import("@/views/bodegas/reservas/TransferenciaReservaIndex.vue");



import Login from "../views/Login.vue";
import AuthLayout from "../components/AuthLayout.vue";
import store from "../store";
import Maintenance from '@/views/errors/Page503.vue';
const routes = [
  {
    path: "/",
    redirect: "/ventas/consultas",
    requiresAuth: true,
  },
  {
    path: "/password-change",
    name: "password-change",
    component: PasswordChange,
    meta: { requiresAuth: true },
    title: "Cambiar Contraseña",
  },
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
  {
    path: "/cobranzas",
    component: LayoutBackend,
    meta: { requiresAuth: true },
    children: [
      {
        path: "cobrofacturas",
        name: "cobranzas-cobrofacturas",
        component: CobranzasFacturas,
        meta: {
          title: "Cobros - Cobros Generales",
        },
      },
      {
        path: "cobropedido",
        name: "cobranzas-cobropedido",
        component: CobranzasPedido,
        meta: {
          title: "Cobros - Cobros Pedido",
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
        path: "cierredecaja",
        name: "cobranzas-cierredecaja",
        component: CobranzasCierredecaja,
        meta: {
          title: "Cobros - Cierre de caja",
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
    ],
  },
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
        component: AprobacionesCrediticias,
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
    ],
  },
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
        path: "transferenciasventa",
        name: "bodegas-transferenciasventa",
        component: TransferenciasVenta,
        meta: {
          title: "Bodegas - Transferencias por venta",
        },
      },
      {
        path: "transferenciasventa/:id",
        name: "bodegas-transferenciasventabodega",
        component: TransferenciasVentaBodega,
        meta: {
          title: "Bodegas - Transferencias por venta bodega",
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
        path: "reservas/transferencias",
        name: "bodegas-reservas-transferencias",
        component: TransferenciaReservaIndex,
        meta: {
          title: "Bodegas - Reservas - Transferencias",
        },
      },
      {
        path: "/bodegas/transferencias/reserva/:ptovtaId",
        name: "bodegas-reservas-transferencias-detalle",
        component: () => import("@/views/bodegas/reservas/TransferenciaReservaDetalleBodega.vue"),
        props: true,
      },
      {
        path: "/bodegas/transferencias/reservas/recibir",
        name: "bodegas-reservas-transferencias-recibir",
        component: () => import("@/views/bodegas/reservas/RecibirReservasIndex.vue"),
        props: true,
      },
    ],
  },

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
          component: () => import("@/views/sistemas/logs/LogsSyncView.vue"),
          meta: { title: "Logs de Sincronización" },
        },
      ],
    },
  ],
},

  //login

  {
    path: "/auth",
    redirect: "/login",
    name: "Auth",
    component: AuthLayout,
    meta: {
      isGuest: true,
      title: "Login",
    },
    children: [
      {
        path: "/login",
        name: "Login",
        component: Login,
      },
    ],
  },

  /** mantenimiento  */
  {
    path: '/mantenimiento',
    name: 'Maintenance',
    component: Maintenance,
    meta: {
      layout: 'simple', // Si usas layouts, usa uno limpio (sin sidebar/header)
      public: true      // Marca para que no requiera auth (si usas middleware de auth)
    }
  },

  /** dashboard de mantenimiento */
  {
    path: "/dashboard/pendientes-despacho/:ptovta",
    name: "dashboard-pendientes-despacho",
    component: () => import("@/views/bodegas/dashboard/PendingDispatchDashboard.vue"),
    props: true,
    meta: {
      layout: 'simple',
      public: true
    }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!store.state.user.token;
  const isGuestRoute = to.meta.isGuest;
  const requiresAuth = to.meta.requiresAuth;
  const must_change_password =
    store.state.must_change_password ||
    JSON.parse(sessionStorage.getItem("MUST_CHANGE_PASSWORD"));

  // usuario no autenticado y ruta ptotegida
  if (requiresAuth && !isAuthenticated) {
    return next({ name: "Login" });
  }

  // usuario autenticado en ruta de invitados como login
  if (isAuthenticated && isGuestRoute) {
    return next({ name: store.state.home });
  }

  //usuario autenticado pero debe cambiar su contraseña e intenta ir a cualquier ruta que no sea password-change
  if (
    isAuthenticated &&
    (must_change_password === true ||
      must_change_password === 1 ||
      must_change_password === "1") &&
    to.name !== "password-change"
  ) {
    return next({ name: "password-change" });
  }

  // usuario que ya cambió su contraseña pero intenta ir a la vista de cambio
  if (
    isAuthenticated &&
    (must_change_password === false ||
      must_change_password === 0 ||
      must_change_password === "0") &&
    to.name === "password-change"
  ) {
    return next({ name: store.state.home });
  }

  // Setear título y continuar normalmente
  const pageTitle = to.meta?.title || 'Inicio';
  const finalTitle = typeof pageTitle === 'string'
    ? pageTitle
    : (pageTitle.text || 'Inicio');
  document.title = `Web Transaccional Tuval | ${finalTitle}`;

  return next();
});

export default router;
