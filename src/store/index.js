import { createStore } from "vuex";
import axiosClient from "../axios";
import axiosPrint from "../axiosPrint";
import { readSessionJson } from "@/utils/sessionStorage";

import { Spanish } from "flatpickr/dist/l10n/es.js";

function normalizeBooleanFlag(value) {
  if (value === true || value === 1) {
    return true;
  }

  if (value === false || value === 0 || value === null || value === undefined) {
    return false;
  }

  const normalized = String(value).trim().toLowerCase();
  return normalized === "true" || normalized === "1";
}

function getStoredPuntoVentaSelectId() {
  const storedId = sessionStorage.getItem("PUNTOVENTASELECTID");
  if (storedId) {
    return storedId;
  }

  const selectedPtoVta = sessionStorage.getItem("PUNTODEVENTASELECT");
  const puntosdeventa = readSessionJson("PUNTOSDEVENTA");
  const selected = Array.isArray(puntosdeventa)
    ? puntosdeventa.find(
      (punto) => String(punto.PTO_VTA_ID) === String(selectedPtoVta)
    )
    : null;

  return selected?.id ?? null;
}

const store = createStore({
  state: {
    user: {
      data: readSessionJson("USERDATA"),
      token: sessionStorage.getItem("TOKEN"),
    },
    must_change_password: normalizeBooleanFlag(sessionStorage.getItem("MUST_CHANGE_PASSWORD")),
    menu: readSessionJson("MENU"),
    home: sessionStorage.getItem("HOME"),
    puntosdeventa: readSessionJson("PUNTOSDEVENTA"),
    bodegas: readSessionJson("BODEGAS"),
    puntodeventaselect: sessionStorage.getItem("PUNTODEVENTASELECT"),
    puntoventaselectid: getStoredPuntoVentaSelectId(),
    currentCliente: readSessionJson("CURRENTCLIENTE"),
    registro_copia: sessionStorage.getItem("REGISTROCOPIA"),
    currentClienteCobro: null,
    currentClienteDevolucion: null,
    currentCaja: null,
    currentSucursal: sessionStorage.getItem("CURRENTSUCURSAL"),
    pregunta_facturar: sessionStorage.getItem("pregunta_facturar"),
    factura_posterior_despacho: sessionStorage.getItem(
      "factura_posterior_despacho"
    ),
    factura_a_demanda: sessionStorage.getItem("factura_a_demanda"),
    factura_siguiente_mes: sessionStorage.getItem("factura_siguiente_mes"),
    alerta_facturar: sessionStorage.getItem("alerta_facturar"),
    cotizacion_id: null,
    cotizacion_serial: null,
    sucursal_facturacion_id: null,
    nota_interna: null,
    orden_de_compra: null,
    bodegaFacturacion: null,
    ret_selected: null,
    resumen_caja: null,
    puntodeventa_caja: null,
    despacho: "Retiro en bodega",
    fecha_entrega: "",
    nota_cliente: null,
    formasdepago: readSessionJson("FORMADEPAGO"),
    formadepago: [],
    condiciondepago_id: null,
    condiciondepago_print: sessionStorage.getItem("CONDICIONDEPAGOPRINT"),
    formadepago_id: null,
    condiciondepago: readSessionJson("CONDICIONDEPAGO"),
    proveedores: readSessionJson("PROVEEDORES"),
    descuentoarticulo: 0,
    descuentooriginal: 0,
    subtotal: 0,
    peso: 0,
    descuento: 0,
    iva: 0,
    total: 0,
    territorios: {},
    provincias_ciudades: {},
    grupos_subgrupos: {},
    today: new Date(),
    nuevadireccion: {
      CLI_SUC_RUC: "",
      CLI_SUC_DESCRIPCION: "",
      CLI_SUC_ID_DIRECCION: null,
      CLI_SUC_DIRECCION: "",
      CLI_SUC_CONTACTO: "",
      CLI_SUC_REFERENCIA: "",
      CLI_SUC_VENDEDOR: "",
      CLI_SUC_TERRITORIO: "COSTA",
      CLI_SUC_CIUDAD: "",
      CLI_SUC_PROVINCIA: "",
      CLI_SUC_TELEFONO: "",
      CLI_SUC_CORREO_ELECTRONICO_SRI: "",
    },
    nuevoCliente: {
      CLI_TIPO_ID: "04",
      CLI_RUC: "",
      CLI_RAZON_SOCIAL: "",
      CLI_NOMBRE_CORTO: "",
      CLI_CONTACTO: "",
      CLI_DIRECCION: "",
      CLI_CIUDAD: "",
      CLI_PROVINCIA: "",
      CLI_TERRITORIO: "COSTA",
      CLI_TELEFONO_1: "",
      CLI_TELEFONO_2: "",
      CLI_TELEFONO_3: "",
      CLI_TELEFONO_4: "",
      CLI_CORREO_ELECT_SRI: "",
      CLI_CORREO_ELECT_NOTIFICACION_INTERNA: "",
      CLI_VENDEDOR: 9,
      CLI_GRUPO: "",
      CLI_SUBGRUPO: "",
    },
    nuevoProspecto: {
      id: null,
      CLI_RUC: "",
      CLI_RAZON_SOCIAL: "",
      CLI_CORREO_ELECT_SRI: "",
      CLI_DIRECCION: "",
      CLI_DSTO_COMERCIAL: 25,
      CLI_CONDICION_PAGO: "CONTADO",
      CLI_TELEFONO_1: "",
    },
    perfiles: {
      loading: false,
      data: [],
    },
    cotizacion: {
      loading: false,
      data: [],
    },
    clientes: {
      loading: false,
      data: [],
    },
    sections: {
      loading: false,
      data: [],
    },
    currentPerfil: {
      data: [],
      loading: false,
    },
    usuarios: {
      loading: false,
      data: [],
    },
    detallepedido: {
      loading: false,
      data: [],
    },
    detallepedido_devolucion: {
      loading: false,
      data: [],
    },
    detalledevolucion: {
      loading: false,
      data: {},
    },
    motivos_devolucion: [],
    sucursales_facturacion: [],
    facturar_existente: {},
    facturar_despachado: {},
    ordendecompra: [],
    traslados: [],
    orden_despacho: null,
    guias_remision: [],
    devoluciones_pedido: [],
    pendientes: false,
    existentes: false,
    estadodecuenta: {
      loading: false,
      data: {},
    },
    segmentocliente: {
      loading: false,
      data: {},
    },
    despachoCotizacion: {},
    despachoPedido: {},
    detallecotizacion: {
      loading: false,
      data: {},
    },

    optionstate: [
      {
        id: "opt-noselect",
        value: "",
        name: "Selecciona una opción",
        selected: "selected",
      },
      { id: "opt-active", value: "active", name: "Activo", selected: null },
      {
        id: "opt-inactive",
        value: "inactive",
        name: "Inactivo",
        selected: null,
      },
    ],
    cotizaciones: {
      loading: false,
      data: [],
    },
    pedidos: {
      loading: false,
      data: [],
    },
    devoluciones: {
      loading: false,
      data: [],
    },
    llenarpedidosporaprobar: null,
    pedidos_crediticios: {
      loading: false,
      data: [],
    },
    devoluciones_por_aprobar: {
      loading: false,
      data: [],
    },
    devoluciones_por_recibir: {
      loading: false,
      data: [],
    },
    llenarpedidosporaprobar_crediticios: null,
    facturas: {
      loading: false,
      data: {},
    },
    cobros_registrados: [],
    cobros_registrados_loading: false,
    facturas_retenciones: {
      loading: false,
      data: {},
    },
    bancos_tuval: [],
    bancos_cliente: [],
    bancos_tarjetas: [],
    cobros_sin_aplicar: [],
    pedidos_por_cobrar: [],
    nuevaRetencion: {
      ret_factura: "",
      ret_fecha_emision: "",
      ret_fecha_vencimiento: "",
      ret_original_factura: "",
      ret_subtotal_factura: "",
      ret_saldo_factura: "",
      ret_iva_factura: "",
      ret_iva: "",
      ret_porcentaje_iva: "",
      ret_renta: "",
      ret_porcentaje_renta: "",
      ret_iva_srv: "",
      ret_porcentaje_iva_srv: "",
      ret_renta_srv: "",
      ret_porcentaje_renta_srv: "",
      ret_emision: "",
      ret_caducidad: "",
      ret_comprobante: "",
      ret_autorizacion: "",
      total: "",
    },
    cobranza: {
      retenciones: [],
      ingreso_efectivo: {},
      ingreso_tarjeta: {},
      ingreso_depositos: [],
      ingreso_aplicaciones: [],
      ingreso_cheques: {},
      cliente_id: "",
      referencia: "",
    },
    ingreso_efectivo: {
      monto: "",
      monto_original: "",
      efectivo_recibido: "",
      monto_no_aplicado: 0.0,
      monto_aplicado: 0.0,
      facturas: [],
    },
    ingreso_tarjeta: {
      monto: "",
      monto_original: "",
      monto_no_aplicado: 0.0,
      monto_aplicado: 0.0,
      facturas: [],
    },
    ingreso_deposito: {
      tipo: "",
      banco: "",
      dep_comprobante: "",
      dep_fecha: "",
      monto: "",
      monto_original: "",
      monto_no_aplicado: 0.0,
      monto_aplicado: 0.0,
      facturas: [],
    },
    ingreso_aplicacion: {
      cobro: "",
      detalle: {},
      comentario: "",
      monto: "",
      monto_original: "",
      monto_no_aplicado: 0.0,
      monto_aplicado: 0.0,
      facturas: [],
    },
    ingreso_cheque: {
      banco: "",
      banco_nombre: "",
      banco_id: "",
      cuenta: "",
      cheque: "",
      monto: "",
      comentario: "",
      fecha_emision: "",
      fecha_vencimiento: "",
      monto_original: "",
      monto_no_aplicado: 0.0,
      monto_aplicado: 0.0,
      cheques: [],
      facturas: [],
    },
    depositos_por_aprobar: [],
    ordenes_despacho_pendientes: [],
    ordenes_despacho_pendientes_loading: false,
    ordenes_despacho: [],
    ordenes_despacho_loading: false,
    detalle_orden_despacho: [],
    detalle_orden_despacho_loading: false,
    ultimaguia: null,
    dashboard_sections: [],
    bodegasdashboard: null,
    transferenciasdashboard: null,
    reposiciondashboard: null,
    recibosdecompral: {
      loading: false,
      data: [],
    },
    recibosdecompralrecibidos: {
      loading: false,
      data: [],
    },
    recibosdecompraleliminados: {
      loading: false,
      data: [],
    },
    detallerecibodecompral: {
      loading: false,
      data: [],
      iva: 0,
      subtotal: 0,
      total: 0,
    },
    transportista: {},
    transportistas: [],
    vehiculo: {},
    vehiculos: [],
    picking: {
      loading: false,
      data: [],
    },
    transferencias_venta: null,
    transferencias_venta_loading: false,
    transferencias_reposicion: null,
    recibos_venta: null,
    recibos_venta_loading: false,
    recibos_reposicion: null,
    recibos_reposicion_loading: false,
    detalle_recibo_reposicion_loading: false,
    generar: false,
    permite_pedido: false,
    pago_a_padido: null,
    flatPickrState: {
      horaInicio: new Date().setMinutes(new Date().getMinutes() + 20),
      horaFin: new Date().setDate(new Date().getDate() + 9),
      configDateTime24: {
        enableTime: true,
        minDate: Date.now(),
        time_24hr: true,
        locale: Spanish,
        monthSelectorType: "static",
      },
    },
    devolucion: {
      volver_a_facturar: false,
      motivo: null,
      cliente_volver_a_facturar_id: null,
      sucursal_facturacion_id: null,
      sucursal_id: null,
      tipo_devolucion: "parcial",
      observacion: null,
    },
    clientes_devolucion: [],
    devolucion_anterior: false,
    despacho_parcial: false,
    notificaciones: {
      loading: false,
      data: [],
    },
    guiasprocesadas: {
      loading: false,
      data: [],
    },
    filtrar_cliente: null,
    articulos_alternativos: {
      loading: false,
      data: [],
    },
    stock_por_articulo: {
      loading: false,
      data: [],
    },
    stock_lote: {
      loading: false,
      data: [],
    },
    margen_articulo: {
      loading: false,
      data: [],
    },
  },
  getters: {},
  actions: {
    login({ commit }, user) {
      return axiosClient.post("/login", user).then(({ data }) => {
        commit("setUser", data.data);
        return data.data;
      });
    },
    logout({ commit }) {
      return axiosClient.get("/logout").then((data) => {
        commit("logout");
        return data;
      });
    },

    sincronizaDataGP(_, path) {
      return axiosClient.get(path).then((response) => {
        return response;
      });
    },
    getPerfiles({ commit }) {
      commit("setPerfilesLoading", true);
      return axiosClient.get("/perfiles").then((res) => {
        commit("setPerfilesLoading", false);
        commit("setPerfiles", res.data.perfiles);
        commit("setSections", res.data.sections);
        commit("setUsuarios", res.data.usuarios);
        return res;
      });
    },
    deletePerfil({ dispatch }, id) {
      return axiosClient.get(`/eliminarperfil/${id}`).then((res) => {
        dispatch("getPerfiles");
        return res;
      });
    },
    updatePerfil({ dispatch }, data) {
      return axiosClient.post("/updateperfil", data).then((response) => {
        dispatch("getPerfiles");
        return response;
      });
    },
    updatePerfilSection({ dispatch }, data) {
      return axiosClient.post("/updateperfilsection", data).then((response) => {
        dispatch("getPerfiles");
        return response;
      });
    },
    updateUsuarioPerfil({ dispatch }, data) {
      return axiosClient.post("/updateusuarioperfil", data).then((response) => {
        dispatch("getPerfiles");
        return response;
      });
    },

    updateCantidad(_, updatecantidad) {
      return axiosClient
        .post("/cotizaciones/updatecantidad", updatecantidad)
        .then((res) => {
          return res;
        });
    },

    /**
     *  nuevas funciones
     */
    facturarPedido(_, pedido) {
      return axiosClient.post("/pedidos/facturarpedido", pedido).then((res) => {
        return res;
      });
    },
    llenarcotizaciones({ commit }, data) {
      commit("setVercotizacionesLoading", true);
      return axiosClient
        .post("/cotizaciones/vercotizaciones", data)
        .then((res) => {
          commit("setVercotizacionesLoading", false);
          commit("getVercotizaciones", res.data.cotizaciones);
          return res;
        });
    },
    imprimir(_, url) {
      return axiosPrint.get(url).then((res) => {
        return res;
      });
    },
    imprimirpost(_, data) {
      return axiosPrint
        .post("/bodegas/transferencias/imprimirpicking", data)
        .then((res) => {
          return res;
        });
    },
    imprimirorden(_, data) {
      return axiosPrint
        .post("/bodegas/guiasderemision/imprimirordenalmacenamiento", data)
        .then((res) => {
          return res;
        });
    },
    imprimirrecibol(_, data) {
      return axiosPrint
        .post("/bodegas/recibosdecompra/imprimirrecibol", data)
        .then((res) => {
          return res;
        });
    },
    imprimirordendevolucion(_, data) {
      return axiosPrint
        .post(
          "/bodegas/guiasderemision/imprimirordenalmacenamientodevolucion",
          data
        )
        .then((res) => {
          return res;
        });
    },
    resumencaja({ commit }, url) {
      return axiosClient
        .get(url + "/" + this.state.user.data.USERID)
        .then((res) => {
          commit("setResumenCaja", res.data.caja);
        });
    },
    llenarpedidos({ commit }, data) {
      commit("setPedidosLoading", true);
      return axiosClient.post("/pedidos/verpedidos", data).then((res) => {
        commit("setPedidosLoading", false);
        commit("getPedidos", res.data.pedidos);
        return res;
      });
    },


    aprobarCotizacion(_, cotizacion) {
      return axiosClient
        .post("/aprobaciones/aprobarcotizacion", cotizacion)
        .then((res) => {
          return res;
        });
    },
    rechazarCotizacion(_, cotizacion) {
      return axiosClient
        .post("/aprobaciones/rechazarcotizacion", cotizacion)
        .then((res) => {
          return res;
        });
    },
    despachoenproceso(_, id) {
      return axiosClient.get("/pedidos/despachoenproceso/" + id).then((res) => {
        return res.data;
      });
    },
    detallepedido({ commit }, pedido) {
      commit("setDetallePedidoLoading", true);
      commit("setEstadoDeCuentaLoading", true);
      return axiosClient.post("/pedidos/detallepedido", pedido).then((res) => {
        commit("setDetallePedidoLoading", false);
        commit("setDetallePedido", res.data);
        commit("setEstadoDeCuentaLoading", false);
        commit("setEstadoDeCuenta", res.data.estadodecuenta);
        commit("setSegmentoClienteLoading", false);
        commit("setSegmentoCliente", res.data.segmento);
        commit("setNivelPrecioClienteDetalle", res.data.nivelPrecio);
        commit("setImagenesOperaciones", res.data.imagenesOperaciones);
        commit("setDocumentosPdf", res.data.documentosPdf);
        commit("setProyectoString", res.data.proyecto);
        return res;
      });
    },
    consultarExistente({ commit }, pedido) {
      commit("setDetallePedidoLoading", true);
      return axiosClient
        .post("/pedidos/consultarexistente", pedido)
        .then((res) => {
          commit("setDetallePedidoLoading", false);
          commit("setFacturarExistente", res.data);
          return res;
        });
    },
    consultarDespachado({ commit }, pedido) {
      commit("setDetallePedidoLoading", true);
      return axiosClient
        .post("/pedidos/consultardespachado", pedido)
        .then((res) => {
          commit("setDetallePedidoLoading", false);
          commit("setFacturarDespachado", res.data);
          return res;
        });
    },
    facturarExistente(_, pedido) {
      return axiosClient
        .post("/pedidos/facturarexistente", pedido)
        .then((res) => {
          return res.data;
        });
    },
    facturarDespachado(_, pedido) {
      return axiosClient
        .post("/pedidos/facturardespachado", pedido)
        .then((res) => {
          return res.data;
        });
    },
    detalleestadodecuenta({ commit }, pedido) {
      commit("setEstadoDeCuentaLoading", true);
      return axiosClient
        .post("/aprobaciones/estadodecuenta", pedido)
        .then((res) => {
          commit("setEstadoDeCuentaLoading", false);
          commit("setEstadoDeCuenta", res.data.data);
          return res;
        });
    },
    detallecotizacion({ commit }, cotizacion) {
      commit("setDespachoCotizacion", {});
      commit("setDetalleCotizacionLoading", true);
      commit("setEstadoDeCuentaLoading", true);

      return axiosClient
        .post("/cotizaciones/detallecotizacion", cotizacion)
        .then((res) => {
          commit("setDetalleCotizacionLoading", false);
          commit("setDetalleCotizacion", res.data.data.detalle);
          commit("setDespachoCotizacion", res.data.data);
          commit("setEstadoDeCuentaLoading", false);
          commit("setEstadoDeCuenta", res.data.data.estadodecuenta);
          commit("setSegmentoClienteLoading", false);
          commit("setSegmentoCliente", res.data.data.segmento);
          commit("setNivelPrecioCotizacion", res.data.data.nivelPrecio);
          commit("setProyectoString", res.data.data.proyecto);
          return res;
        });
    },
    territorios({ commit }) {
      return axiosClient.post("/consultas/territorios").then((res) => {
        commit("setTerritorios", res.data.territorios);
        commit("setProvinciasCiudades", res.data.provincias_ciudades);
        commit("setGruposSubgrupos", res.data.grupos_subgrupos);
        return res;
      });
    },
    guardarCliente({ commit }, direccion) {
      direccion.CLI_PUNTO_VENTA = this.state.puntodeventaselect;
      return axiosClient
        .post("/cotizaciones/guardarcliente", direccion)
        .then((res) => {
          commit("resetNuevoCliente");
          return res.data;
        });
    },
    estadoCaja({ commit }) {
      return axiosClient
        .get(
          "/cobranzas/estadocaja/" +
          this.state.puntodeventaselect +
          "/" +
          this.state.user.data.USERID
        )
        .then((res) => {
          commit("setEstadoCaja", res.data);
          return res.data;
        });
    },
    estadoCajafecha(_, fecha) {
      return axiosClient
        .get(
          "/cobranzas/estadocaja/" + fecha + "/" + this.state.user.data.USERID
        )
        .then((res) => {
          return res.data;
        });
    },
    cerrarCaja() {
      return axiosClient
        .get(
          "/cobranzas/cerrarcaja/" +
          this.state.puntodeventaselect +
          "/" +
          this.state.user.data.USERID
        )
        .then((res) => {
          return res.data;
        });
    },

    depositosPorAprobar({ commit }) {
      return axiosClient.post("/cobranzas/depositosporaprobar").then((res) => {
        commit("setDepositosPorAprobar", res.data);
      });
    },

    aprobarDepositos(_, id) {
      return axiosClient.post("/cobranzas/aprobardeposito", id).then((res) => {
        return res.data;
      });
    },
    rechazarDepositos(_, id) {
      return axiosClient.post("/cobranzas/rechazardeposito", id).then((res) => {
        return res.data;
      });
    },
    bodegasDashboardInterval({ commit, dispatch }) {
      commit(
        "setIntervalBodegasDashboard",
        setInterval(() => {
          dispatch("bodegasDashboard");
        }, 10000)
      );
    },
    bodegasDashboardStop({ commit }) {
      commit("bodegasDashboardStop");
    },
    bodegasDashboard({ commit }) {
      const consulta = {
        puntodeventa_id: this.state.puntodeventaselect,
      };
      return axiosClient.post("/bodegas/dashboard", consulta).then((res) => {
        commit("setDashboardSections", res.data);
      });
    },
    bodegasBandejaRecibosdecompraL({ commit }) {
      commit("setRecibosdecompralLoading", true);
      const consulta = {
        puntodeventa_id: this.state.puntodeventaselect,
      };
      return axiosClient
        .post("/bodegas/recibosdecompra/bandeja", consulta)
        .then((res) => {
          commit("setRecibosdecompral", res.data);
          commit("setRecibosdecompralLoading", false);
        });
    },
    detallerecibodecompral({ commit }, ordendecompral) {
      commit("setDetalleOrdendecompralLoading", true);
      return axiosClient
        .post("/bodegas/recibosdecompra/detalle", ordendecompral)
        .then((res) => {
          commit("setDetalleOrdendecompralLoading", false);
          commit("setDetalleOrdendecompral", res.data);
          return res;
        });
    },
    recibirOrdendecompraL(_, ordendecompral) {
      return axiosClient
        .post("/bodegas/recibosdecompra/recibir", ordendecompral)
        .then((res) => {
          return res;
        });
    },
    eliminarOrdendecompraL(_, ordendecompral) {
      return axiosClient
        .post("/bodegas/recibosdecompra/eliminar", ordendecompral)
        .then((res) => {
          return res;
        });
    },
    guardarOrdenDeCompra(_, cotizacion) {
      return axiosClient
        .post("/cotizaciones/guardarordendecompra", cotizacion)
        .then((res) => {
          return res;
        });
    },
    guardarOrdenDeCompraPedido(_, pedido) {
      return axiosClient
        .post("/pedidos/guardarordendecompra", pedido)
        .then((res) => {
          return res;
        });
    },
    guardarMensajePedido(_, pedido) {
      return axiosClient.post("/pedidos/guardarmensaje", pedido).then((res) => {
        return res;
      });
    },
    guardarMensajeCotizacion(_, cotizacion) {
      return axiosClient
        .post("/cotizaciones/guardarmensaje", cotizacion)
        .then((res) => {
          return res;
        });
    },
    consultacajausuario() {
      return axiosClient
        .get(
          "/cobranzas/getcajausuario/" +
          this.state.puntodeventaselect +
          "/" +
          this.state.user.data.USERID
        )
        .then((res) => {
          return res.data;
        });
    },
    consultacierrecajausuario(_, consulta) {
      return axiosClient
        .post("/cobranzas/consultacierrecajausuario", consulta)
        .then((res) => {
          return res.data;
        });
    },
    consultacobroscliente(_, consulta) {
      return axiosClient
        .post("/cobranzas/consultacobroscliente", consulta)
        .then((res) => {
          return res.data;
        });
    },
    puntodeventacaja({ commit }) {
      return axiosClient.get("/consultas/puntodeventacaja").then((res) => {
        commit("setPuntodeventaCaja", res.data);
      });
    },
    getTransportistas({ commit }) {
      return axiosClient
        .get("/bodegas/transportes/transportistas")
        .then((res) => {
          commit("setTransportistas", res.data);
        });
    },
    saveTransportista({ dispatch }, transportista) {
      return axiosClient
        .post("/bodegas/transportes/savetransportista", transportista)
        .then((res) => {
          dispatch("getTransportistas");
          return res;
        });
    },
    saveVehiculo({ dispatch }, vehiculo) {
      return axiosClient
        .post("/bodegas/transportes/savevehiculo", vehiculo)
        .then((res) => {
          dispatch("getTransportistas");
          return res;
        });
    },
    deleteTransportista({ dispatch }, id) {
      return axiosClient
        .delete("/bodegas/transportes/deletetransportista/" + id)
        .then((res) => {
          dispatch("getTransportistas");
          return res;
        });
    },
    deleteVehiculo({ dispatch }, id) {
      return axiosClient
        .delete("/bodegas/transportes/deletevehiculo/" + id)
        .then((res) => {
          dispatch("getTransportistas");
          return res;
        });
    },
    ordenesDespachoPendientes({ commit }) {
      commit("setOrdenesDespachoPendientesLoading", true);
      return axiosClient
        .get("/despachos/ordenespendientes/" + this.state.puntodeventaselect)
        .then((res) => {
          commit("setOrdenesDespachoPendientesLoading", false);
          commit("setOrdenesDespachoPendientes", res.data);
        });
    },
    liberarOrdenDespacho(_, data) {
      return axiosClient
        .post("/despachos/liberarordendespacho", data)
        .then((res) => {
          return res.data;
        });
    },
    ordenesDespachoSinDetalle({ commit }, estado = "liberada") {
      commit("setOrdenesDespachoLoading", true);
      return axiosClient
        .get(
          "/despachos/ordenesliberadassindetalle/" +
          this.state.puntodeventaselect +
          "/" +
          estado
        )
        .then((res) => {
          commit("setOrdenesDespachoLoading", false);
          commit("setOrdenesDespacho", res.data);
        });
    },
    getUltimaGuia({ commit }) {
      //commit("setOrdenesDespachoLoading", true);
      return axiosClient
        .get("/despachos/getultimaguia/" + this.state.puntodeventaselect)
        .then((res) => {
          //commit("setOrdenesDespachoLoading", false);
          commit("setUltimaGuia", res.data);
        });
    },
    descripcionOrdenDespacho(_, id) {
      return axiosClient
        .get("/despachos/detalleordenliberada/" + id)
        .then((res) => {
          return res.data;
        });
    },
    detalleOrdenDespacho({ commit }, id) {
      commit("setDetalleOrdenLoading", true);
      return axiosClient.get("/despachos/detalleorden/" + id).then((res) => {
        commit("setDetalleOrden", res.data);
        commit("setDetalleOrdenLoading", false);
        return res.data;
      });
    },
    verOrdenDespacho({ commit }, id) {
      commit("setDetalleOrdenLoading", true);
      return axiosClient
        .get("/despachos/verordendespacho/" + id)
        .then((res) => {
          commit("setVerDetalleOrden", res.data);
          commit("setDetalleOrdenLoading", false);
          return res.data;
        });
    },
    detallePicking({ commit }, pedido_id) {
      commit("setDetallePickingLoading", true);
      return axiosClient.get("/despachos/picking/" + pedido_id).then((res) => {
        commit("setDetallePickingLoading", false);
        commit("setDetallePicking", res.data);
      });
    },
    cancelarProcesoDespacho({ commit }, pedido_id) {
      commit("setDetallePickingLoading", true);
      return axiosClient.get("/despachos/cancelarprocesodespacho/" + pedido_id);
    },
    transferenciasVentaStop({ commit }) {
      commit("transferenciasVentaStop");
    },
    transferenciasVenta({ commit }) {
      commit("setTransferenciasVentaLoading", true);
      return axiosClient
        .get(
          "/bodegas/transferencias/transferenciasventa/" +
          this.state.puntodeventaselect
        )
        .then((res) => {
          commit("setTransferenciasVentaLoading", false);
          commit("setTransferenciasVenta", res.data);
        });
    },
    transferenciasVentaPedido({ commit }, data) {
      commit("setTransferenciasVentaLoading", true);
      if (!data.buscarcompartimiento) data.buscarcompartimiento = "null";
      return axiosClient
        .get(
          "/bodegas/transferencias/transferenciasventa/" +
          this.state.puntodeventaselect +
          "/" +
          data.buscarpedido +
          "/" +
          data.buscarcompartimiento
        )
        .then((res) => {
          commit("setTransferenciasVentaLoading", false);
          return res.data.data;
        });
    },
    transferenciasReposicion({ commit }) {
      return axiosClient
        .get(
          "/bodegas/reposicion/transferenciasreposicion/" +
          this.state.puntodeventaselect
        )
        .then((res) => {
          commit("setTransferenciasReposicion", res.data);
        });
    },
    transferenciasReposicionDocumento(_, documento) {
      return axiosClient
        .get(
          "/bodegas/reposicion/transferenciasreposicion/" +
          this.state.puntodeventaselect +
          "/" +
          documento
        )
        .then((res) => {
          return res.data.traslados;
        });
    },
    recibosVenta({ commit }) {
      commit("setRecibosVentaLoading", true);
      return axiosClient
        .get(
          "/bodegas/transferencias/recibosventa/" +
          this.state.puntodeventaselect
        )
        .then((res) => {
          commit("setRecibosVentaLoading", false);
          commit("setRecibosVenta", res.data);
        });
    },
    recibosReposicion({ commit }) {
      commit("setRecibosReposicionLoading", true);
      return axiosClient
        .get(
          "/bodegas/reposicion/recibosreposicionindividual/" +
          this.state.puntodeventaselect
        )
        .then((res) => {
          commit("setRecibosReposicionLoading", false);
          commit("setRecibosReposicion", res.data);
        });
    },

    detalleReciboReposicion({ commit }, id) {
      commit("setDetalleReciboReposicionLoading", true);
      return axiosClient
        .get("/bodegas/reposicion/detallereciboreposicion/" + id)
        .then((res) => {
          commit("setDetalleReciboReposicionLoading", false);
          return res.data;
        });
    },

    detallePickingTransferencia({ commit }, traslados) {
      commit("setDetallePickingLoading", true);
      return axiosClient
        .post("/bodegas/transferencias/picking", traslados)
        .then((res) => {
          commit("setDetallePickingLoading", false);
          commit("setDetallePicking", res.data);
        });
    },
    eliminarGuiaRemision(_, data) {
      return axiosClient
        .delete("/bodegas/guiasderemision/eliminarguia/" + data.id)
        .then((res) => {
          return res.data;
        });
    },
    pedidoscliente({ commit }, cliente_id) {
      commit("setPedidosLoading", true);
      commit("setDevolucionesLoading", true);
      return axiosClient
        .get(
          "/devoluciones/pedidoscliente/" +
          cliente_id +
          "/" +
          this.state.puntodeventaselect
        )
        .then((res) => {
          commit("setPedidosLoading", false);
          commit("setDevolucionesLoading", false);
          commit("getPedidos", res.data.pedidos);
          commit("setDevoluciones", res.data.devoluciones);
          return res;
        });
    },
    rechazarOrdenDespacho(_, id) {
      return axiosClient
        .get("/despachos/rechazarordendespacho/" + id)
        .then((res) => {
          return res.data;
        });
    },
    getReposicion(_, params) {
      return axiosClient
        .post("/bodegas/getreposicion", {
          fecha: params.fecha,
          numDoc: params.numDoc,
        })
        .then((res) => {
          return res.data;
        });
    },
    detalleDevolucion({ commit }, devolucion) {
      commit("setDetalleDevolucionLoading", true);

      return axiosClient
        .post("/devoluciones/detalledevolucion", devolucion)
        .then((res) => {
          commit("setDetalleDevolucionLoading", false);
          commit("setDetalleDevolucion", res.data);
          commit("setSegmentoClienteLoading", false);
          commit("setSegmentoCliente", res.data.segmento);
          return res;
        });
    },
    aprobarDevolucion({ dispatch }, devolucion) {
      return axiosClient
        .post("/aprobaciones/aprobardevolucion", devolucion)
        .then((res) => {
          dispatch("verDevolucionesPorAprobar");
          return res;
        });
    },
    rechazarDevolucion({ dispatch }, devolucion) {
      return axiosClient
        .post("/aprobaciones/rechazardevolucion", devolucion)
        .then((res) => {
          dispatch("verDevolucionesPorAprobar");
          return res;
        });
    },
    verDevolucionesPorAprobar({ commit }) {
      commit("setDevolucionesPorAprobarLoading", true);
      return axiosClient
        .get("/aprobaciones/verdevolucionesporaprobar")
        .then((res) => {
          commit("setDevolucionesPorAprobar", res.data.devoluciones);
          commit("setDevolucionesPorAprobarLoading", false);
          return res;
        });
    },

    recibirDevolucion(_, devolucion) {
      return axiosClient
        .post("/devoluciones/recibirdevolucion", devolucion)
        .then((res) => {
          return res.data;
        });
    },
      },
  mutations: {
    /* FUNCIONES EN INTERVALOS */


    setIntervalBodegasDashboard(state, newInterval) {
      state.bodegasdashboard = newInterval;
    },
    bodegasDashboardStop(state) {
      clearInterval(state.bodegasdashboard);
    },
    transferenciasVentaStop(state) {
      clearInterval(state.transferenciasdashboard);
    },
            /* FIN DE INTERVALOS */
    logout: (state) => {
      state.user.data = {};
      state.user.token = null;
      state.user.home = null;
      state.user.menu = [];
      state.home = null;
      state.menu = [];
      state.currentCliente = null;
      state.currentSucursal = null;
      state.currentTest = null;
      state.sucursal_facturacion_id = null;
      state.must_change_password = null;
      sessionStorage.clear();
    },
    setCurrentcliente: (state, cliente) => {
      state.currentCliente = cliente;
      sessionStorage.setItem("CURRENTCLIENTE", JSON.stringify(cliente));
      state.condiciondepago_id = cliente.CLI_CONDICION_PAGO;
      state.condiciondepago_print = cliente.CLI_CONDICION_PAGO;
      sessionStorage.setItem(
        "CONDICIONDEPAGOPRINT",
        cliente.CLI_CONDICION_PAGO
      );
    },
    resetCurrentcliente: (state) => {
      state.currentCliente = null;
      sessionStorage.setItem(
        "CURRENTCLIENTE",
        JSON.stringify(state.currentCliente)
      );
    },
    setCurrentSucursal: (state, currentSucursal) => {
      sessionStorage.setItem("CURRENTSUCURSAL", currentSucursal);
      state.currentSucursal = currentSucursal;
    },

    setCurrentclienteDevolucion: (state, cliente) => {
      state.currentClienteDevolucion = cliente;
    },
    setUser: (state, userData) => {
      state.user.token = userData.token;
      state.user.data = userData.user;
      state.menu = userData.menu;
      state.home = userData.home.to;
      state.puntosdeventa = userData.puntosdeventa;
      state.formasdepago = userData.formadepago;
      state.condiciondepago = userData.condiciondepago;
      state.proveedores = userData.proveedores;
      state.puntodeventaselect = userData.puntodeventaselect.PTO_VTA_ID;
      state.puntoventaselectid = userData.puntodeventaselect.id ?? null;
      state.bodegas = userData.puntodeventaselect.bodegas;
      state.must_change_password = normalizeBooleanFlag(userData.must_change_password);
      sessionStorage.setItem("MUST_CHANGE_PASSWORD", String(state.must_change_password));
      sessionStorage.setItem("TOKEN", userData.token);
      sessionStorage.setItem("USERDATA", JSON.stringify(userData.user));
      sessionStorage.setItem("MENU", JSON.stringify(userData.menu));
      sessionStorage.setItem("HOME", userData.home.to);
      sessionStorage.setItem(
        "PUNTOSDEVENTA",
        JSON.stringify(userData.puntosdeventa)
      );
      sessionStorage.setItem(
        "BODEGAS",
        JSON.stringify(userData.puntodeventaselect.bodegas)
      );
      sessionStorage.setItem(
        "FORMADEPAGO",
        JSON.stringify(userData.formadepago)
      );
      sessionStorage.setItem(
        "CONDICIONDEPAGO",
        JSON.stringify(userData.condiciondepago)
      );
      sessionStorage.setItem(
        "PROVEEDORES",
        JSON.stringify(userData.proveedores)
      );
      sessionStorage.setItem(
        "PUNTODEVENTASELECT",
        userData.puntodeventaselect.PTO_VTA_ID
      );
      if (state.puntoventaselectid) {
        sessionStorage.setItem("PUNTOVENTASELECTID", state.puntoventaselectid);
      } else {
        sessionStorage.removeItem("PUNTOVENTASELECTID");
      }
    },
    setUserAccess: (state, data) => {
      const menu = Array.isArray(data?.menu) ? data.menu : [];
      const home = typeof data?.home === "string" ? data.home : data?.home?.to;

      state.menu = menu;
      sessionStorage.setItem("MENU", JSON.stringify(menu));

      if (home) {
        state.home = home;
        sessionStorage.setItem("HOME", home);
      }
    },
    setMustChangePassword: (state, value) => {
      state.must_change_password = normalizeBooleanFlag(value);
      sessionStorage.setItem("MUST_CHANGE_PASSWORD", String(state.must_change_password));
    },
    setPerfilesLoading: (state, loading) => {
      state.perfiles.loading = loading;
    },
    setPerfiles: (state, perfiles) => {
      state.perfiles.data = perfiles;
    },
    resetClientes: (state) => {
      state.clientes.data = [];
    },
    setSections: (state, sections) => {
      state.sections.data = sections;
    },
    setUsuarios: (state, usuarios) => {
      state.usuarios.data = usuarios;
    },
    setCotizacionLoading: (state, loading) => {
      state.cotizacion.loading = loading;
    },
    addCotizacion: (state, articulo) => {
      state.cotizacion.data.push(articulo);
    },
    resetCotizacion: (state) => {
      state.currentCliente = null;
      state.currentSucursal = null;
      state.currentTest = null;
      state.sucursal_facturacion_id = null;
      state.cotizacion_id = null;
      state.cotizacion_serial = null;
      state.nota_interna = null;
      state.orden_de_compra = null;
      state.bodegaFacturacion = null;
      state.condiciondepago_id = null;
      state.condiciondepago_print = null;
      sessionStorage.setItem("CONDICIONDEPAGOPRINT", null);
      state.formadepago_id = null;
      state.despacho = "Retiro en bodega";
      state.nota_cliente = null;
      state.cotizacion.data = [];
      state.fecha_entrega =
        state.today.getFullYear() +
        "-" +
        (state.today.getMonth() + 1) +
        "-" +
        state.today.getDate();
    },
    resetCotizacionProspecto: (state) => {
      state.cotizacion.data = [];
    },
    setVercotizacionesLoading: (state, loading) => {
      state.cotizaciones.loading = loading;
    },
    getVercotizaciones: (state, cotizaciones) => {
      state.cotizaciones.data = cotizaciones;
    },
    setPedidosLoading: (state, loading) => {
      state.pedidos.loading = loading;
    },
    setDevolucionesLoading: (state, loading) => {
      state.devoluciones.loading = loading;
    },
    setTransferenciasVentaLoading: (state, loading) => {
      state.transferencias_venta_loading = loading;
    },
    getPedidos: (state, pedidos) => {
      state.pedidos.data = Object.freeze(pedidos);
    },
    setDevoluciones: (state, devoluciones) => {
      state.devoluciones.data = devoluciones;
    },
    setDevolucionesPorAprobarLoading: (state, estado) => {
      state.devoluciones_por_aprobar.loading = estado;
    },
    setDevolucionesPorAprobar: (state, devoluciones) => {
      state.devoluciones_por_aprobar.data = devoluciones;
    },

    llenaformadepago: (state, condiciondepago_id) => {
      state.formadepago = [];
      state.formasdepago.map((forma) => {
        if (forma.DESC_FORMA_PAGO_CONDICION_PAGO === condiciondepago_id.value) {
          state.formadepago.push(forma);
        }
      });
    },
    setDetallePedidoLoading: (state, loading) => {
      state.detallepedido.loading = loading;
    },
    setDescuentoArticulo: (state, value) => {
      state.descuentoarticulo = value;
    },
    setDescuentoOriginal: (state, value) => {
      state.descuentooriginal = value;
    },
    setDetallePedido: (state, data) => {
      state.despachoPedido = {
        tipo_despacho: data.tipo_despacho ?? null,
        fle_usuario_aut_id: data.fle_usuario_aut_id ?? null,
        fle_fecha_aut: data.fle_fecha_aut ?? null,
        fle_valor: data.fle_valor ?? null,
        requiere_aprobacion_flete: data.requiere_aprobacion_flete ?? null,
        motivo_aprobacion_flete: data.motivo_aprobacion_flete ?? null,
      };
      state.detallepedido.data = data.detalle;
      state.ordendecompra = data.ordendecompra;
      state.traslados = data.traslados;
      state.orden_despacho = data.orden_despacho;
      state.guias_remision = data.guias_remision;
      state.pendientes = data.pendientes;
      state.existentes = data.existentes;
      state.devoluciones_pedido = data.devoluciones;
      state.has_guide_dispatched = data.has_guide_dispatched;
    },
    setDetalleDevolucionLoading: (state, loading) => {
      state.detalledevolucion.loading = loading;
    },
    setDetalleDevolucion: (state, data) => {
      state.detalledevolucion.data = data.detalle;
    },
    setDetallePedidoDevolucionLoading: (state, loading) => {
      state.detallepedido_devolucion.loading = loading;
    },
    setDetallePedidoDevolucion: (state, data) => {
      state.detallepedido_devolucion.data = data.detalle;
      state.motivos_devolucion = data.motivos;
      state.clientes_devolucion = data.clientes;
      state.devolucion_anterior = data.devolucion_anterior;
      let tiene_despacho = false;
      let sin_despacho = false;

      data.detalle.map((item) => {
        if (item.despacho) {
          tiene_despacho = true;
        } else {
          sin_despacho = true;
        }
      });

      state.despacho_parcial = tiene_despacho && sin_despacho;
      state.despacho_parcial_item = !!data.items_devueltos;
    },
    setFacturarExistente: (state, data) => {
      state.facturar_existente = data.data;
    },
    setFacturarDespachado: (state, data) => {
      state.facturar_despachado = data.facturar_despachado;
    },
    setDetalleCotizacionLoading: (state, loading) => {
      state.detallecotizacion.loading = loading;
    },
    setDespachoCotizacion: (state, data) => {
      state.despachoCotizacion = {
        tipo_despacho: data.tipo_despacho ?? null,
        fle_usuario_aut_id: data.fle_usuario_aut_id ?? null,
        fle_fecha_aut: data.fle_fecha_aut ?? null,
        fle_valor: data.fle_valor ?? 0,
        requiere_aprobacion_flete: data.requiere_aprobacion_flete ?? false,
        motivo_aprobacion_flete: data.motivo_aprobacion_flete ?? null,
      };
    },
    setDetalleCotizacion: (state, detalle) => {
      state.detallecotizacion.data = detalle;
    },
    setEstadoDeCuentaLoading: (state, loading) => {
      state.estadodecuenta.loading = loading;
    },
    setEstadoDeCuenta: (state, detalle) => {
      state.estadodecuenta.data = detalle;
    },
    setSegmentoCliente: (state, data) => {
      state.segmentocliente.data = data;
    },
    setNivelPrecioClienteDetalle: (state, data) => {
      state.nivelPrecioClienteDetalle = data;
    },
    setSegmentoClienteLoading: (state, loading) => {
      state.segmentocliente.loading = loading;
    },

    setNivelPrecioCotizacion: (state, data) => {
      state.nivelPrecioCotizacion = data;
    },
    setImagenesOperaciones: (state, data) => {
      state.imagenesOperaciones = data;
    },

    setDocumentosPdf: (state, data) => {
      state.documentosPdf = data;
    },
    setProyectoString: (state, data) => {
      state.proyecto = data
    },

    setTerritorios: (state, territorios) => {
      state.territorios = territorios;
    },
    setProvinciasCiudades: (state, provincias_ciudades) => {
      state.provincias_ciudades = provincias_ciudades;
      state.nuevadireccion.CLI_SUC_PROVINCIA = 9;
      state.nuevoCliente.CLI_PROVINCIA = 9;
    },
    setGruposSubgrupos: (state, grupos_subgrupos) => {
      state.grupos_subgrupos = grupos_subgrupos;
    },
    setDepositosPorAprobar: (state, data) => {
      state.depositos_por_aprobar = data.depositos;
    },
    setOrdenesDespachoPendientes: (state, data) => {
      data.ordenes.map((orden) => {
        orden.numero_pedido = orden.pedido.pedido;
        orden.CLI_RAZON_SOCIAL = orden.pedido.CLI_RAZON_SOCIAL;
        orden.CLI_RUC = orden.pedido.CLI_RUC;
        orden.fecha_pedido = orden.pedido.created_at;
        orden.total = orden.pedido.total;
      });

      state.ordenes_despacho_pendientes = data.ordenes;
    },

    setOrdenesDespachoPendientesLoading: (state, value) => {
      state.ordenes_despacho_pendientes_loading = value;
    },

    setOrdenesDespacho: (state, data) => {
      state.ordenes_despacho = data.ordenes;
      state.ultimaguia = data.ultimaguia;
    },
    eliminaDespacho: (state, index) => {
      state.ordenes_despacho.splice(index, 1);
      let nuevo = [];
      state.ordenes_despacho.map((orden) => {
        nuevo.push(orden);
      });
      state.ordenes_despacho = nuevo;
    },

    setUltimaGuia: (state, data) => {
      state.ultimaguia = data.ultimaguia;
    },
    resetOrdenesDespacho: (state) => {
      state.ordenes_despacho = [];
    },
    resetOrdenesDespachoPendientes: (state) => {
      state.ordenes_despacho_pendientes = [];
    },
    setOrdenesDespachoLoading: (state, value) => {
      state.ordenes_despacho_loading = value;
    },
    setDetalleOrdenLoading: (state, value) => {
      state.detalle_orden_despacho_loading = value;
    },
    setDetalleOrden: (state, data) => {
      state.detalle_orden_despacho = data.detalle;
    },
    setVerDetalleOrden: (state, data) => {
      state.detalle_orden_despacho = data;
    },
    resetNuevoCliente: (state) => {
      state.nuevoCliente = {
        CLI_TIPO_ID: "04",
        CLI_RUC: "",
        CLI_RAZON_SOCIAL: "",
        CLI_NOMBRE_CORTO: "",
        CLI_CONTACTO: "",
        CLI_DIRECCION: "",
        CLI_CIUDAD: "",
        CLI_PROVINCIA: "",
        CLI_TERRITORIO: "COSTA",
        CLI_TELEFONO_1: "",
        CLI_TELEFONO_2: "",
        CLI_TELEFONO_3: "",
        CLI_TELEFONO_4: "",
        CLI_CORREO_ELECT_SRI: "",
        CLI_CORREO_ELECT_NOTIFICACION_INTERNA: "",
        CLI_VENDEDOR: 9,
        CLI_GRUPO: "",
        CLI_SUBGRUPO: "",
      };
    },
    resetProspecto: (state) => {
      state.nuevoProspecto = {
        id: null,
        CLI_RUC: "",
        CLI_RAZON_SOCIAL: "",
        CLI_CORREO_ELECT_SRI: "",
        CLI_DIRECCION: "",
        CLI_DSTO_COMERCIAL: 25,
        CLI_CONDICION_PAGO: "CONTADO",
        CLI_TELEFONO_1: "",
      };
    },
    setDashboardSections: (state, data) => {
      state.dashboard_sections = data.dashboard_sections;
    },
    setRecibosdecompralLoading: (state, loading) => {
      state.recibosdecompral.loading = loading;
    },
    setRecibosdecompral: (state, data) => {
      state.recibosdecompral.data = data.bandeja;
      state.recibosdecompralrecibidos.data = data.recibidos;
      state.recibosdecompraleliminados.data = data.eliminados;
    },
    setDetalleOrdendecompralLoading: (state, loading) => {
      state.detallerecibodecompral.loading = loading;
    },
    setResumenCaja: (state, data) => {
      state.resumen_caja = data;
    },
    setDetalleOrdendecompral: (state, data) => {
      state.detallerecibodecompral.data = data.detalle;
      state.detallerecibodecompral.iva = data.iva;
      state.detallerecibodecompral.subtotal = data.subtotal;
      state.detallerecibodecompral.total = data.total;
    },
    setEstadoCaja: (state, data) => {
      state.currentCaja = data.caja;
    },
    setPuntodeventaCaja: (state, data) => {
      state.puntodeventa_caja = data.puntosdeventa;
    },
    resetTransportista: (state) => {
      state.transportista = {
        transportista_id: null,
        id: null,
        nombre: null,
        tipo_identificacion: "05",
        identificacion: null,
        tipo_licencia: "Tipo C",
        direccion: null,
        telefono: null,
      };
    },
    resetVehiculo: (state) => {
      state.vehiculo = {
        vehiculo_id: null,
        ruta: null,
        id: null,
        nombre: null,
        marca: null,
        modelo: null,
        placa: null,
      };
    },

    setTransportista: (state, transportista) => {
      state.transportista = transportista;
    },
    setVehiculo: (state, vehiculo) => {
      state.vehiculo = vehiculo;
    },
    setTransportistas: (state, data) => {
      state.transportistas = data.transportistas;
      state.vehiculos = data.vehiculos;
    },
    setDetallePickingLoading: (state, loading) => {
      state.picking.loading = loading;
    },
    setDetallePicking: (state, data) => {
      state.picking.data = data.picking;
    },
    setDetallePickingLimpio: (state, data) => {
      state.picking.data = [];
      state.picking.peso = 0;
      data.map((traslado) => {
        if (traslado.seleccionado && traslado.seleccionado > 0) {
          state.picking.data.push(traslado);
          state.picking.peso += traslado.seleccionado * traslado.ART_PESO;
        }
      });
    },
    setTransferenciasVenta: (state, data) => {
      state.transferencias_venta = data.data;
    },

    setTransferenciasReposicion: (state, data) => {
      state.transferencias_reposicion = data.bodegas;
    },
    setRecibosVentaLoading: (state, value) => {
      state.recibos_venta_loading = value;
    },
    setRecibosVenta: (state, data) => {
      state.recibos_venta = data.recibos;
    },
    setRecibosReposicion: (state, data) => {

      state.recibos_reposicion = data.recibos;
    },
    setRecibosReposicionLoading: (state, value) => {
      state.recibos_reposicion_loading = value;
    },
    setDetalleReciboReposicionLoading: (state, value) => {
      state.detalle_recibo_reposicion_loading = value;
    },
    setGenerar: (state, data) => {
      state.generar = data;
    },
    setDespacho: (state, value) => {
      state.despacho = value;
    },
    resetFlatPickrState: (state) => {
      const horaInicio = new Date();
      horaInicio.setMinutes(horaInicio.getMinutes() + 20);
      const horaFin = new Date();
      horaFin.setDate(horaFin.getDate() + 9);

      state.flatPickrState = {
        horaInicio:
          horaInicio.getFullYear() +
          "-" +
          (horaInicio.getMonth() < 9 ? "0" : "") +
          (horaInicio.getMonth() + 1) +
          "-" +
          (horaInicio.getDate() < 10 ? "0" : "") +
          horaInicio.getDate() +
          " " +
          (horaInicio.getHours() < 10 ? "0" : "") +
          horaInicio.getHours() +
          ":" +
          (horaInicio.getMinutes() < 10 ? "0" : "") +
          horaInicio.getMinutes(),
        horaFin:
          horaFin.getFullYear() +
          "-" +
          (horaFin.getMonth() < 9 ? "0" : "") +
          (horaFin.getMonth() + 1) +
          "-" +
          (horaFin.getDate() < 10 ? "0" : "") +
          horaFin.getDate() +
          " " +
          (horaFin.getHours() < 10 ? "0" : "") +
          horaFin.getHours() +
          ":" +
          (horaFin.getMinutes() < 10 ? "0" : "") +
          horaFin.getMinutes(),
        configDateTime24: {
          enableTime: true,
          minDate: Date.now(),
          time_24hr: true,
        },
      };
    },
    resetDevolucion: (state) => {
      state.devolucion.volver_a_facturar = false;
      state.devolucion.motivo = null;
      state.devolucion.cliente_volver_a_facturar_id = null;
      state.devolucion.sucursal_facturacion_id = null;
      state.devolucion.sucursal_id = null;
      state.devolucion.tipo_devolucion = "parcial";
      state.devolucion.observacion = null;
    },
    setClienteRefacturarDevolucion: (state, data) => {
      state.devolucion.cliente_volver_a_facturar_id = data.cliente_id;
      state.devolucion.sucursal_facturacion_id = data.sucursal_facturacion_id;
      state.devolucion.sucursal_id = data.sucursal_id;
    },
    setSucursalesFacturacion: (state) => {
      const cliente = state.clientes_devolucion.find(
        (item) => item.id === state.devolucion.cliente_volver_a_facturar_id
      );
      state.sucursales_facturacion = cliente?.sucursales ?? [];
    },
    resetFiltrarCliente: (state) => {
      state.filtrar_cliente = null;
    },

  },
  modules: {},
});

export default store;
