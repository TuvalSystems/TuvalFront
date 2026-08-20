import {
  createRouter,
  createWebHistory,
  RouterView,
} from "vue-router";
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
  import("@/views/ventas/cotizaciones/CrearClienteView.vue");

// Cobranzas: cobroFacturas
// const CobranzasFacturas = () =>
//   import("@/views/cobranzas/CobranzasFacturasView.vue");
// const CobranzasPedido = () =>
//   import("@/views/cobranzas/CobranzasPedidoView.vue");
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


const RecibosVenta = () => import("@/views/bodegas/RecibosVenta.vue");
const RecibosReposicion = () => import("@/views/bodegas/RecibosReposicion.vue");
const TransferenciasReposicion = () =>
  import("@/views/bodegas/TransferenciasReposicion.vue");
const TransferenciasReposicionBodega = () =>
  import("@/views/bodegas/TransferenciasReposicionBodega.vue");
const BodegasConsultas = () => import("@/views/bodegas/BodegasConsultas.vue");


const Notificaciones = () => import("@/views/notificaciones/index.vue");
const PasswordChange = () => import("@/views/auth/PasswordChange.vue");

/** devoluciones bodegas index */

const recibirDevolucionesIndex = () => import("@/views/bodegas/devoluciones/RecibirDevolucionesIndex.vue");



import store from "../store";
import Maintenance from '@/views/errors/Page503.vue';
import {
  canAccessRouteFromMenu,
  getHomeRouteName,
} from "@/utils/routeAccess";
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
            component: () => import("@/views/sistemas/logs/LogsIndex.vue"),
            meta: { title: "Logs de Sincronización" },
          },
        ],
      },
      {
        path: "Movil",
        name: "sistemas-movil",
        component: RouterView,
        children: [
          {
            path: "lista-versiones",
            name: "sistemas-movil-gestion-versiones",
            component: () => import("@/views/sistemas/movil/GestionVersionesIndex.vue"),
            meta: { title: "Gestión de Versiones App" }
          }
        ],
      },
      {
        path: "Seguridad",
        name: "sistemas-seguridad",
        component: RouterView,
        children: [
          {
            path: "usuarios",
            name: "sistemas-seguridad-usuarios",
            component: () => import("@/views/sistemas/seguridad/usuarios/UsuariosIndex.vue"),
            meta: { title: "Gestión de Usuarios" }
          },
          {
            path: "perfiles",
            name: "sistemas-seguridad-perfiles",
            component: () => import("@/views/sistemas/seguridad/accesos/perfiles/ProfileIndex.vue"),
            meta: { title: "Gestión de Perfiles" }
          },
          {
            path: "secciones",
            name: "sistemas-seguridad-secciones",
            component: () => import("@/views/sistemas/seguridad/accesos/secciones/SectionIndex.vue"),
            meta: { title: "Gestión de Secciones" }
          }
        ],
      }

    ],
  },

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

  //login

  {
    path: "/auth",
    redirect: "/login",
    name: "Auth",
    component: () => import("@/components/AuthLayout.vue"),
    meta: {
      isGuest: true,
      title: "Login",
    },
    children: [
      {
        path: "/login",
        name: "Login",
        component: () => import("@/views/auth/Login.vue"),
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

let userActionsPromise = null;

async function getUserActions() {
  if (!userActionsPromise) {
    userActionsPromise = import(
      "@/composables/sistemas/seguridad/usuarios/useUserActions"
    ).then(({ useUserActions }) => useUserActions());
  }

  return userActionsPromise;
}

async function refreshUserAccessForRoute() {
  const { fetchSectionsActivesByUser } = await getUserActions();
  const result = await fetchSectionsActivesByUser();

  if (!result.ok) {
    const error = result.raw || new Error(result.message);
    error.status = result.status;
    throw error;
  }

  const accessData = result.data ?? {};
  store.commit("setUserAccess", accessData);

  return {
    menu: Array.isArray(accessData?.menu) ? accessData.menu : [],
    homeRouteName: getHomeRouteName(accessData?.home) || store.state.home,
  };
}

router.beforeEach(async (to, from, next) => {
  const isAuthenticated = !!store.state.user.token;
  const isGuestRoute = to.meta.isGuest;
  const requiresAuth = to.meta.requiresAuth;
  let homeRouteName = store.state.home;
  const must_change_password =
    store.state.must_change_password ||
    JSON.parse(sessionStorage.getItem("MUST_CHANGE_PASSWORD"));

  // usuario no autenticado y ruta ptotegida
  if (requiresAuth && !isAuthenticated) {
    return next({ name: "Login" });
  }

  // usuario autenticado en ruta de invitados como login
  if (isAuthenticated && isGuestRoute) {
    try {
      const access = await refreshUserAccessForRoute();
      homeRouteName = access.homeRouteName || homeRouteName;
    } catch (error) {
      const status = error?.response?.status || error?.status;

      if (status === 401) {
        store.commit("logout");
        return next({ name: "Login" });
      }
      // Si falla el refresco, se conserva el home local para no bloquear el flujo.
    }

    if (!homeRouteName) return next();
    return next({ name: homeRouteName });
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
    to.name === "password-change" &&
    homeRouteName
  ) {
    return next({ name: homeRouteName });
  }

  if (
    isAuthenticated &&
    requiresAuth &&
    !to.meta.public &&
    to.name !== "password-change"
  ) {
    let menu = store.state.menu;
    let accessWasRefreshed = false;

    try {
      const access = await refreshUserAccessForRoute();
      menu = access.menu;
      homeRouteName = access.homeRouteName || homeRouteName;
      accessWasRefreshed = true;
    } catch (error) {
      const status = error?.response?.status || error?.status;

      if (status === 401) {
        store.commit("logout");
        return next({ name: "Login" });
      }

      if (status === 403 && homeRouteName) {
        return next({ name: homeRouteName });
      }
    }

    if (
      homeRouteName &&
      !canAccessRouteFromMenu(to, menu, homeRouteName, {
        allowEmptyMenu: !accessWasRefreshed,
      })
    ) {
      return next({ name: homeRouteName });
    }
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
