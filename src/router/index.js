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
const VentasReservas = () => import("@/views/ventas/reservas/ReservasIndex.vue");
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
const CobranzasConsultasCierredecaja = () =>
  import("@/views/cobranzas/ConsultasCierredecajaView.vue");
const CobranzasConsultasCobros = () =>
  import("@/views/cobranzas/ConsultasCobrosView.vue");
const LiberarOrdenDespacho = () =>
  import("@/views/cobranzas/LiberarOrdenDespacho.vue");

// Aprobaciones: comerciales

const AprobacionesComerciales = () =>
  import("@/views/aprobaciones/ComercialesView.vue");
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

const Notificaciones = () => import("@/views/Notificaciones.vue");
const PasswordChange = () => import("@/views/auth/PasswordChange.vue");
import Login from "../views/Login.vue";
import AuthLayout from "../components/AuthLayout.vue";
import store from "../store";

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
        path: "consultascierredecaja",
        name: "cobranzas-consultascierredecaja",
        component: CobranzasConsultasCierredecaja,
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
        component: DevolucionesBodegas,
        meta: {
          title: "Bodegas - Devoluciones",
        },
      },
    ],
  },

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
  document.title = "Web Transaccional Tuval | " + to.meta.title;
  return next();
});

export default router;
