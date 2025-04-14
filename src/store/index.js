import { createStore } from "vuex";
import axiosClient from "../axios";
import axiosPrint from "../axiosPrint";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { addDays } from "@/functions";
import { ref } from "vue";

const store = createStore({
  state: {
    user: {
      data: JSON.parse(sessionStorage.getItem("USERDATA")),
      token: sessionStorage.getItem("TOKEN"),
    },
    menu: JSON.parse(sessionStorage.getItem("MENU")),
    home: sessionStorage.getItem("HOME"),
    puntosdeventa: JSON.parse(sessionStorage.getItem("PUNTOSDEVENTA")),
    bodegas: JSON.parse(sessionStorage.getItem("BODEGAS")),
    puntodeventaselect: sessionStorage.getItem("PUNTODEVENTASELECT"),
    currentCliente: JSON.parse(sessionStorage.getItem("CURRENTCLIENTE")),
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
    formasdepago: JSON.parse(sessionStorage.getItem("FORMADEPAGO")),
    formadepago: [],
    condiciondepago_id: null,
    condiciondepago_print: sessionStorage.getItem("CONDICIONDEPAGOPRINT"),
    formadepago_id: null,
    verarticulos: false,
    verproveedor: false,
    indexproveedor: null,
    buscar_articulo: {
      select_codigo: "empieza",
      text_codigo: "",
      codigo3l: "",
      terminal: "",
      select_nombre: "contiene",
      text_nombre: "",
    },
    condiciondepago: JSON.parse(sessionStorage.getItem("CONDICIONDEPAGO")),
    proveedores: JSON.parse(sessionStorage.getItem("PROVEEDORES")),
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
    articulos: {
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
  },
  getters: {},
  actions: {
    login({ commit }, user) {
      return axiosClient.post("/login", user).then(({ data }) => {
        commit("setUser", data);
        return data;
      });
    },
    logout({ commit }) {
      return axiosClient.get("/logout").then((data) => {
        commit("logout");
        return data;
      });
    },
    notificaciones() {
      return axiosClient.get("/notificaciones").then((res) => {
        return res.data;
      });
    },
    sincronizaDataGP({ commit }, path) {
      return axiosClient.get(path).then((response) => {
        return response;
      });
    },
    getSecciones({ commit }) {
      commit("setSeccionesLoading", true);
      return axiosClient.get("/listadesecciones").then((res) => {
        commit("setSeccionesLoading", false);
        commit("setSections", res.data.sections);
        return res;
      });
    },
    updateseccion({ commit }, data) {
      return axiosClient.post("/updateseccion", data).then((response) => {
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
    buscararticulo({ commit }, data) {
      commit("setArticuloLoading", true);
      return axiosClient.post("/consultas/buscararticulo", data).then((res) => {
        commit("setArticuloLoading", false);
        commit("setArticulo", res.data.articulos);
        return res;
      });
    },
    buscarclientes({ commit }, data) {
      commit("setClientesLoading", true);
      return axiosClient.post("/consultas/buscarcliente", data).then((res) => {
        commit("setClientesLoading", false);
        commit("setClientes", res.data.clientes);
        return res;
      });
    },
    cupoDisponible({ commit }, ruc) {
      return axiosClient.get("/consultas/cupodisponible/" + ruc).then((res) => {
        return res.data.cliente;
      });
    },
    addCotizacion({ commit }, data) {
      commit("setCotizacionLoading", true);
      return axiosClient
        .post("/cotizaciones/selectarticuloprospecto", data)
        .then((res) => {
          commit("setCotizacionLoading", false);
          commit("addCotizacion", res.data.articulo);
          return res;
        });
    },
    consultarStock({ commit }, data) {
      return axiosClient.post("/consultas/consultarstock", data).then((res) => {
        return res.data;
      });
    },
    consultaStockOthers({commit}, data) {
      return axiosClient.post('/consultas/consultastockothers', data)
          .then(res => {
              return res.data;
          })
  },
    selectarticulo({ commit }, data) {
      commit("setCotizacionLoading", true);
      return axiosClient
        .post("/cotizaciones/selectarticulo", data)
        .then((res) => {
          commit("setCotizacionLoading", false);
          commit("addCotizacion", res.data.articulo);
          return res;
        });
    },
    llenarcotizacion({ commit }, data) {
      commit("setCotizacionLoading", true);
      return axiosClient
        .post("/cotizaciones/llenarcotizacion", data)
        .then((res) => {
          commit("setCotizacionLoading", false);
          commit("getCotizacion", res.data.articulos);
          return res;
        });
    },
    /* llenarcotizacionProspecto({commit}, data) {
            commit('setCotizacionLoading', true)
            return axiosClient.post('/cotizaciones/llenarcotizacionprospecto', data)
            .then(res => {
                commit('setCotizacionLoading', false)
                commit("getCotizacion", res.data.articulos);
                return res;
            })
        }, */
    eliminarArticulo({ commit }, articulo) {
      return axiosClient.post("/eliminararticulo", articulo).then((res) => {
        return res;
      });
    },
    updateCantidad({ commit }, updatecantidad) {
      return axiosClient
        .post("/cotizaciones/updatecantidad", updatecantidad)
        .then((res) => {
          return res;
        });
    },
    updatePeso({ commit }, updatePeso) {
      return axiosClient
        .post("/cotizaciones/updatepeso", updatePeso)
        .then((res) => {
          return res;
        });
    },
    updateModificador({ commit }, updatemodificador) {
      return axiosClient
        .post("/cotizaciones/updatemodificador", updatemodificador)
        .then((res) => {
          return res;
        });
    },
    updateStock({ commit }, stock) {
      return axiosClient
        .post("/cotizaciones/updatestock", stock)
        .then((res) => {
          return res;
        });
    },
    updateDescripcion({ commit }, updatedescripcion) {
      return axiosClient
        .post("/updatedescripcion", updatedescripcion)
        .then((res) => {
          return res;
        });
    },
    updateValor({ commit }, updatevalor) {
      return axiosClient
        .post("/cotizaciones/updatevalor", updatevalor)
        .then((res) => {
          return res;
        });
    },
    updateDescuento({ commit }, updatedescuento) {
      return axiosClient
        .post("/cotizaciones/updatedescuento", updatedescuento)
        .then((res) => {
          return res;
        });
    },
    saveProveedor({ commit }, articulo) {
      return axiosClient.post("/saveproveedor", articulo).then((res) => {
        return res;
      });
    },
    guardarCotizacion({ commit }, info) {
      return axiosClient
        .post("/cotizaciones/guardarcotizacion", info)
        .then((res) => {
          commit("resetCotizacion");
          return res;
        });
    },
    guardarCotizacionProspecto({ commit }, info) {
      return axiosClient
        .post("/cotizaciones/guardarcotizacionprospecto", info)
        .then((res) => {
          commit("resetCotizacion");
          return res;
        });
    },
    limpiarcotizacion({ commit }, info) {
      return axiosClient
        .post("/cotizaciones/limpiarcotizacion", info)
        .then((res) => {
          commit("resetCotizacion");
          return res;
        });
    },
    consultaStockCotizacion({ commit }, info) {
      return axiosClient
        .post("/consultas/consultastockcotizacion", info)
        .then((res) => {
          return res;
        });
    },
    consultaStockPedido({ commit }, info) {
      return axiosClient
        .post("/consultas/consultastockpedido", info)
        .then((res) => {
          return res;
        });
    },
    guardarPedido({ commit }, info) {
      return axiosClient.post("/pedidos/guardarpedido", info).then((res) => {
        commit("resetCotizacion");
        return res;
      });
    },
    facturarPedido({ commit }, pedido) {
      return axiosClient.post("/pedidos/facturarpedido", pedido).then((res) => {
        return res;
      });
    },
    facturarCotizacion({ commit }, pedido) {
      return axiosClient
        .post("/pedidos/facturarcotizacion", pedido)
        .then((res) => {
          return res;
        });
    },
    guardarOrdenPedido() {
      return axiosClient.post(
        "/guardarordenpedido",
        this.state.cotizacion.data
      );
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
    imprimir({ commit }, url) {
      return axiosPrint.get(url).then((res) => {
        return res;
      });
    },
    imprimirpost({ commit }, data) {
      return axiosPrint
        .post("/bodegas/transferencias/imprimirpicking", data)
        .then((res) => {
          return res;
        });
    },
    imprimirorden({ commit }, data) {
      return axiosPrint
        .post("/bodegas/guiasderemision/imprimirordenalmacenamiento", data)
        .then((res) => {
          return res;
        });
    },
    imprimirrecibol({ commit }, data) {
      return axiosPrint
        .post("/bodegas/recibosdecompra/imprimirrecibol", data)
        .then((res) => {
          return res;
        });
    },
    imprimirordendevolucion({ commit }, data) {
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
    sendfacturasgp({ commit }) {
      commit("setPedidosLoading", true);
      return axiosClient.get("/pedidos/sendfacturasgp").then((res) => {
        return res;
      });
    },
    llenarpedidosporaprobarInterval({ commit, dispatch }) {
      commit(
        "setIntervalPedidosporAprobar",
        setInterval(() => {
          dispatch("llenarpedidosporaprobar");
        }, 10000)
      );
    },
    llenarpedidosporaprobarStop({ commit }) {
      commit("llenarpedidosporaprobarStop");
    },
    llenarpedidosporaprobar({ commit }) {
      const consulta = {
        puntodeventa_id: this.state.puntodeventaselect,
      };
      return axiosClient
        .post("/verpedidosycotizacionesporaprobar", consulta)
        .then((res) => {
          commit("getPedidos", res.data.pedidos);
          commit("getVercotizaciones", res.data.cotizaciones);
          return res;
        });
    },

    llenarpedidosporaprobarcrediticiosInterval({ commit, dispatch }) {
      commit(
        "setIntervalPedidosporAprobarCrediticios",
        setInterval(() => {
          dispatch("llenarpedidosporaprobarcrediticios");
        }, 10000)
      );
    },
    llenarpedidosporaprobarcrediticiosStop({ commit }) {
      commit("llenarpedidosporaprobarcrediticiosStop");
    },
    llenarpedidosporaprobarcrediticios({ commit }) {
      const consulta = {
        puntodeventa_id: this.state.puntodeventaselect,
      };
      return axiosClient
        .post("/aprobaciones/verpedidosporaprobarcrediticios", consulta)
        .then((res) => {
          commit("setPedidosCrediticios", res.data.pedidos);
          return res;
        });
    },

    aprobarPedido({ commit, dispatch }, pedido) {
      return axiosClient
        .post("/aprobaciones/aprobarpedido", pedido)
        .then((res) => {
          dispatch("llenarpedidosporaprobar");
          return res;
        });
    },

    aprobarCotizacion({ commit, dispatch }, cotizacion) {
      return axiosClient
        .post("/aprobaciones/aprobarcotizacion", cotizacion)
        .then((res) => {
          dispatch("llenarpedidosporaprobar");
          return res;
        });
    },
    rechazarCotizacion({ commit, dispatch }, cotizacion) {
      return axiosClient
        .post("/aprobaciones/rechazarcotizacion", cotizacion)
        .then((res) => {
          dispatch("llenarpedidosporaprobar");
          return res;
        });
    },
    rechazarPedido({ commit, dispatch }, cotizacion) {
      return axiosClient
        .post("/aprobaciones/rechazarpedido", cotizacion)
        .then((res) => {
          dispatch("llenarpedidosporaprobar");
          return res;
        });
    },
    rechazarPedidoPorStock({ commit, dispatch }, pedido) {
      return axiosClient
        .post("/aprobaciones/rechazarpedidoporstock", pedido)
        .then((res) => {
          dispatch("llenarpedidosporaprobar");
          return res;
        });
    },
    consultaParaAprobarPedido({ commit, dispatch }, pedido) {
      return axiosClient
        .post("/aprobaciones/consultaparaaprobarpedido", pedido)
        .then((res) => {
          return res.data;
        });
    },
    aprobarPedidoCrediticio({ commit, dispatch }, pedido) {
      return axiosClient
        .post("/aprobaciones/aprobarpedidocrediticio", pedido)
        .then((res) => {
          dispatch("llenarpedidosporaprobarcrediticios");
          return res;
        });
    },
    rechazarPedidoCrediticioPorStock({ commit, dispatch }, pedido) {
      return axiosClient
        .post("/aprobaciones/rechazarpedidocrediticioporstock", pedido)
        .then((res) => {
          dispatch("llenarpedidosporaprobarcrediticios");
          return res;
        });
    },
    rechazarPedidoCrediticio({ commit, dispatch }, pedido) {
      return axiosClient
        .post("/aprobaciones/rechazarpedidocrediticio", pedido)
        .then((res) => {
          dispatch("llenarpedidosporaprobarcrediticios");
          return res;
        });
    },
    despachoenproceso({}, id) {
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
    facturarExistente({ commit }, pedido) {
      return axiosClient
        .post("/pedidos/facturarexistente", pedido)
        .then((res) => {
          return res.data;
        });
    },
    facturarDespachado({ commit }, pedido) {
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
          commit("setEstadoDeCuenta", res.data.detalle);
          return res;
        });
    },
    detallecotizacion({ commit }, cotizacion) {
      commit("setDetalleCotizacionLoading", true);
      commit("setEstadoDeCuentaLoading", true);
      return axiosClient
        .post("/cotizaciones/detallecotizacion", cotizacion)
        .then((res) => {
          commit("setDetalleCotizacionLoading", false);
          commit("setDetalleCotizacion", res.data.detalle);
          commit("setEstadoDeCuentaLoading", false);
          commit("setEstadoDeCuenta", res.data.estadodecuenta);
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
    guardarDireccion({ commit }, direccion) {
      direccion.CLI_DIR_PUNTO_VENTA = this.state.puntodeventaselect;
      return axiosClient
        .post("/cotizaciones/guardardireccion", direccion)
        .then((res) => {
          return res;
        });
    },
    guardarCliente({ commit }, direccion) {
      direccion.CLI_PUNTO_VENTA = this.state.puntodeventaselect;
      return axiosClient
        .post("/cotizaciones/guardarcliente", direccion)
        .then((res) => {
          commit("resetNuevoCliente");
          return res;
        });
    },
    recuperarCotizacion({ commit }, cotizacion) {
      return axiosClient
        .post("/cotizaciones/recuperarcotizacion", cotizacion)
        .then((res) => {
          this.state.cotizacion_id = res.data.cotizacion_id;
          this.state.cotizacion_serial = cotizacion.cotizacion;
          this.state.sucursal_facturacion_id =
            cotizacion.sucursal_facturacion_id;
          this.state.nota_interna = cotizacion.nota_interna;
          this.state.orden_de_compra = cotizacion.orden_de_compra;
          this.state.bodegaFacturacion = cotizacion.BOD_BODEGA;
          this.state.despacho = cotizacion.despacho;
          this.state.fecha_entrega = cotizacion.fecha_entrega; //.substr(0, 10)
          this.state.nota_cliente = cotizacion.nota_cliente;
          this.state.factura_siguiente_mes = 0;
          this.state.factura_a_demanda = 0;
          this.state.pregunta_facturar = 0;
          this.state.factura_posterior_despacho = 0;
          this.state.alerta_facturar = null;

          if (res.data.cliente.CLI_FACTURA_POSTERIOR_AL_DESPACHO === "SI") {
            if (res.data.cliente.CLI_DIA_MAXIMO_MES_FACTURACION === 1) {
              this.state.factura_posterior_despacho = 1;
              this.state.factura_a_demanda = 1;
              this.state.alerta_facturar =
                "Factura a demanda posterior al despacho";
            } else if (
              this.state.today.getDate() <=
              res.data.cliente.CLI_DIA_MAXIMO_MES_FACTURACION
            ) {
              this.state.factura_posterior_despacho = 1;
            } else {
              this.state.factura_posterior_despacho = 1;
              this.state.pregunta_facturar = 1;
              this.state.factura_siguiente_mes = 1;
            }
          }

          sessionStorage.setItem(
            "factura_posterior_despacho",
            this.state.factura_posterior_despacho
          );
          sessionStorage.setItem(
            "factura_a_demanda",
            this.state.factura_a_demanda
          );
          sessionStorage.setItem(
            "factura_siguiente_mes",
            this.state.factura_siguiente_mes
          );
          sessionStorage.setItem("alerta_facturar", this.state.alerta_facturar);
          sessionStorage.setItem(
            "pregunta_facturar",
            this.state.pregunta_facturar
          );

          commit("setCurrentcliente", res.data.cliente);
          commit("setCurrentSucursal", res.data.currentSucursal);
          commit("resetRegistroCopia");
          commit("setCondicionPago", cotizacion);
        });
    },
    recuperarCotizacionProspecto({ commit }, cotizacion) {
      return axiosClient
        .post("/cotizaciones/recuperarcotizacionprospecto", cotizacion)
        .then((res) => {
          this.state.nuevoCliente = {
            CLI_RUC: res.data.cliente.CLI_RUC,
            CLI_RAZON_SOCIAL: res.data.cliente.CLI_RAZON_SOCIAL,
            CLI_NOMBRE_CORTO: "",
            CLI_CONTACTO: "",
            CLI_DIRECCION: res.data.cliente.CLI_DIRECCION,
            CLI_CIUDAD: "",
            CLI_PROVINCIA: "",
            CLI_TERRITORIO: "COSTA",
            CLI_TELEFONO_1: res.data.cliente.CLI_TELEFONO_1,
            CLI_TELEFONO_2: "",
            CLI_TELEFONO_3: "",
            CLI_TELEFONO_4: "",
            CLI_CORREO_ELECT_SRI: res.data.cliente.CLI_CORREO_ELECT_SRI,
            CLI_CORREO_ELECT_NOTIFICACION_INTERNA: "",
            CLI_VENDEDOR: 9,
            CLI_GRUPO: "",
            CLI_SUBGRUPO: "",
          };
          this.state.cotizacion_id = res.data.cotizacion_id;
          this.state.cotizacion_serial = cotizacion.cotizacion;
          this.state.nota_interna = cotizacion.nota_interna;
          this.state.orden_de_compra = cotizacion.orden_de_compra;
          this.state.bodegaFacturacion = cotizacion.BOD_BODEGA;
          this.state.despacho = cotizacion.despacho;
          this.state.nota_cliente = cotizacion.nota_cliente;
          this.state.condiciondepago_id = cotizacion.COND_ID;
          this.state.condiciondepago_print = cotizacion.COND_ID;
          sessionStorage.setItem("CONDICIONDEPAGOPRINT", cotizacion.COND_ID);
          this.state.formadepago_id = cotizacion.DESC_FORMA_PAGO_CODIGO;
        });
    },
    volverapedirCotizacion({ commit }, cotizacion) {
      return axiosClient
        .post("/cotizaciones/volverapedircotizacion", cotizacion)
        .then((res) => {
          this.state.cotizacion_id = null;
          this.state.cotizacion_serial = null;
          this.state.nota_interna = cotizacion.nota_interna;
          this.state.orden_de_compra = cotizacion.orden_de_compra;
          this.state.bodegaFacturacion = cotizacion.BOD_BODEGA;
          this.state.despacho = cotizacion.despacho;
          this.state.nota_cliente = cotizacion.nota_cliente;

          this.state.factura_siguiente_mes = 0;
          this.state.factura_a_demanda = 0;
          this.state.pregunta_facturar = 0;
          this.state.factura_posterior_despacho = 0;
          this.state.alerta_facturar = null;

          if (res.data.cliente.CLI_FACTURA_POSTERIOR_AL_DESPACHO === "SI") {
            if (res.data.cliente.CLI_DIA_MAXIMO_MES_FACTURACION === 1) {
              this.state.factura_posterior_despacho = 1;
              this.state.factura_a_demanda = 1;
              this.state.alerta_facturar =
                "Factura a demanda posterior al despacho";
            } else if (
              this.state.today.getDate() <=
              res.data.cliente.CLI_DIA_MAXIMO_MES_FACTURACION
            ) {
              this.state.factura_posterior_despacho = 1;
            } else {
              this.state.factura_posterior_despacho = 1;
              this.state.pregunta_facturar = 1;
              this.state.factura_siguiente_mes = 1;
            }
          }

          sessionStorage.setItem(
            "factura_posterior_despacho",
            this.state.factura_posterior_despacho
          );
          sessionStorage.setItem(
            "factura_a_demanda",
            this.state.factura_a_demanda
          );
          sessionStorage.setItem(
            "factura_siguiente_mes",
            this.state.factura_siguiente_mes
          );
          sessionStorage.setItem("alerta_facturar", this.state.alerta_facturar);
          sessionStorage.setItem(
            "pregunta_facturar",
            this.state.pregunta_facturar
          );

          commit("setCurrentcliente", res.data.cliente);
          commit("setCurrentSucursal", res.data.currentSucursal);
          commit("setRegistroCopia", res.data.registro_copia);
          commit("setCondicionPago", cotizacion);
        });
    },
    llenarcotizacionProspecto({ commit }, cotizacion) {
      commit("setCotizacionLoading", true);
      return axiosClient
        .post("/cotizaciones/llenarcotizacionprospecto", cotizacion)
        .then((res) => {
          this.state.cotizacion_id = res.data.cotizacion.id;
          this.state.cotizacion_serial = res.data.cotizacion.cotizacion;
          this.state.nota_interna = res.data.cotizacion.nota_interna;
          this.state.orden_de_compra = res.data.cotizacion.orden_de_compra;
          this.state.bodegaFacturacion = res.data.cotizacion.BOD_BODEGA;
          this.state.despacho = res.data.cotizacion.despacho;
          this.state.nota_cliente = res.data.cotizacion.nota_cliente;
          this.state.condiciondepago_id = res.data.cotizacion.COND_ID;
          this.state.condiciondepago_print = res.data.cotizacion.COND_ID;
          sessionStorage.setItem(
            "CONDICIONDEPAGOPRINT",
            res.data.cotizacion.COND_ID
          );
          this.state.formadepago_id =
            res.data.cotizacion.DESC_FORMA_PAGO_CODIGO;
          commit("setCurrentcliente", res.data.cliente);
          commit("setCurrentSucursal", res.data.currentSucursal);
          commit("setCotizacionLoading", false);
        });
    },
    recuperarPedido({ commit }, pedido) {
      return axiosClient
        .post("/pedidos/recuperarpedido", pedido)
        .then((res) => {
          commit("resetCotizacion");
          commit("setCurrentcliente", res.data.cliente);
          commit("setRegistroCopia", res.data.registro_copia);
          commit("setCurrentSucursal", res.data.currentSucursal);
          commit("setCondicionPagoSinPrint", pedido);
        });
    },
    copiarPedido({ commit }, data) {
      return axiosClient.post("/pedidos/copiarpedido", data).then((res) => {
        commit("resetCotizacion");
        commit("setCurrentcliente", res.data.cliente);
        commit("setRegistroCopia", res.data.registro_copia);
        commit("setCurrentSucursal", res.data.currentSucursal);
      });
    },
    cancelarPedido({ commit }, pedido) {
      return axiosClient.post("/pedidos/cancelarpedido", pedido).then((res) => {
        return res.data;
      });
    },
    estadodecuenta({ commit }, cliente) {
      commit("setFacturasLoading", true);
      return axiosClient
        .post("/cobranzas/estadodecuentacliente", cliente)
        .then((res) => {
          commit("setFacturasLoading", false);
          commit("setFacturas", res.data);
        });
    },
    registrarcobro({ commit }, cobranza) {
      commit("setFacturasLoading", true);
      return axiosClient
        .post("/cobranzas/registrarcobro", cobranza)
        .then((res) => {
          return res;
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
    estadoCajafecha({ commit }, fecha) {
      return axiosClient
        .get(
          "/cobranzas/estadocaja/" + fecha + "/" + this.state.user.data.USERID
        )
        .then((res) => {
          return res.data;
        });
    },
    abrirCaja() {
      return axiosClient.get(
        "/cobranzas/abrircaja/" +
          this.state.puntodeventaselect +
          "/" +
          this.state.user.data.USERID
      );
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
    cobrosRegistrados({ commit }, cliente) {
      commit("setCobrosRegistradosLoading", true);
      return axiosClient
        .post("/cobranzas/cobrosregistrados", cliente)
        .then((res) => {
          commit("setCobrosRegistrados", res.data);
          commit("setCobrosRegistradosLoading", false);
          return res.data;
        });
    },
    depositosPorAprobar({ commit }) {
      return axiosClient.post("/cobranzas/depositosporaprobar").then((res) => {
        commit("setDepositosPorAprobar", res.data);
      });
    },

    aprobarDepositos({ commit }, id) {
      return axiosClient.post("/cobranzas/aprobardeposito", id).then((res) => {
        return res.data;
      });
    },
    rechazarDepositos({ commit }, id) {
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
    recibirOrdendecompraL({ commit }, ordendecompral) {
      return axiosClient
        .post("/bodegas/recibosdecompra/recibir", ordendecompral)
        .then((res) => {
          return res;
        });
    },
    eliminarOrdendecompraL({ commit }, ordendecompral) {
      return axiosClient
        .post("/bodegas/recibosdecompra/eliminar", ordendecompral)
        .then((res) => {
          return res;
        });
    },
    guardarOrdenDeCompra({ commit }, cotizacion) {
      return axiosClient
        .post("/cotizaciones/guardarordendecompra", cotizacion)
        .then((res) => {
          return res;
        });
    },
    guardarOrdenDeCompraPedido({ commit }, pedido) {
      return axiosClient
        .post("/pedidos/guardarordendecompra", pedido)
        .then((res) => {
          return res;
        });
    },
    guardarMensajePedido({ commit }, pedido) {
      return axiosClient.post("/pedidos/guardarmensaje", pedido).then((res) => {
        return res;
      });
    },
    guardarMensajeCotizacion({ commit }, cotizacion) {
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
    consultacierrecajausuario({ commit }, consulta) {
      return axiosClient
        .post("/cobranzas/consultacierrecajausuario", consulta)
        .then((res) => {
          return res.data;
        });
    },
    consultacobroscliente({ commit }, consulta) {
      return axiosClient
        .post("/cobranzas/consultacobroscliente", consulta)
        .then((res) => {
          return res.data;
        });
    },
    checkRucProspecto({ commit }, prospecto) {
      return axiosClient
        .post("/cotizaciones/checkrucprospecto", prospecto)
        .then((res) => {
          return res.data;
        });
    },
    consultaretencion({ commit }, prospecto) {
      return axiosClient
        .post("/cobranzas/consultaretencion", prospecto)
        .then((res) => {
          return res.data;
        });
    },
    consultacheque({ commit }, cheque) {
      return axiosClient
        .post("/cobranzas/consultacheque", cheque)
        .then((res) => {
          return res.data;
        });
    },
    consultadeposito({ commit }, cheque) {
      return axiosClient
        .post("/cobranzas/consultadeposito", cheque)
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
    liberarOrdenDespacho({ dispatch }, data) {
      return axiosClient
        .post("/despachos/liberarordendespacho", data)
        .then((res) => {
          return res.data;
        });
    },
    checkdespachadoscompletos({}) {
      return axiosClient
        .get("/despachos/checkdespachadoscompletos")
        .then(() => {
          return;
        });
    },
    ordenesDespacho({ commit }, estado = "liberada") {
      commit("setOrdenesDespachoLoading", true);
      return axiosClient
        .get(
          "/despachos/ordenesliberadas/" +
            this.state.puntodeventaselect +
            "/" +
            estado
        )
        .then((res) => {
          commit("setOrdenesDespachoLoading", false);
          commit("setOrdenesDespacho", res.data);
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
    getUltimaGuia({ commit }, estado = "liberada") {
      //commit("setOrdenesDespachoLoading", true);
      return axiosClient
        .get("/despachos/getultimaguia/" + this.state.puntodeventaselect)
        .then((res) => {
          //commit("setOrdenesDespachoLoading", false);
          commit("setUltimaGuia", res.data);
        });
    },
    descripcionOrdenDespacho({ commit }, id) {
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
    transferenciasVentaInterval({ commit, dispatch }) {
      commit(
        "setIntervalTransferenciasVenta",
        setInterval(() => {
          dispatch("transferenciasVenta");
        }, 20000)
      );
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
          return res.data.traslados;
        });
    },
    cancelarPicking({ commit }, picking) {
      return axiosClient
        .post("/bodegas/transferencias/cancelarpicking", picking)
        .then((res) => {
          return res.data;
        });
    },
    transferenciasReposicionInterval({ commit, dispatch }) {
      commit(
        "setIntervalTransferenciasReposicion",
        setInterval(() => {
          dispatch("transferenciasReposicion");
        }, 10000)
      );
    },
    transferenciasReposicionStop({ commit }) {
      commit("transferenciasReposicionStop");
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
    transferenciasReposicionDocumento({ commit }, documento) {
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
    consultarGuiaTraslado({ commit }, data) {
      return axiosClient
        .post("/bodegas/guiasderemision/consultarguiagenerada", data)
        .then((res) => {
          return res;
        });
    },
    generarGuiaTraslado({ commit }, data) {
      return axiosClient
        .post("/bodegas/guiasderemision/generarguiatraslado", data)
        .then((res) => {
          return res;
        });
    },
    generarGuiaVenta({ commit }, data) {
      return axiosClient
        .post("/bodegas/guiasderemision/generarguiaventa", data)
        .then((res) => {
          return res;
        });
    },
    eliminarGuiaRemision({ commit }, data) {
      return axiosClient
        .delete("/bodegas/guiasderemision/eliminarguia/" + data.id)
        .then((res) => {
          return res.data;
        });
    },
    despacharGuiaRemision({ commit }, data) {
      return axiosClient
        .get("/bodegas/guiasderemision/despacharguia/" + data.id)
        .then((res) => {
          return res.data;
        });
    },
    recibirGuiaRemision({ commit }, data) {
      return axiosClient
        .post("/bodegas/guiasderemision/recibirguia", data)
        .then((res) => {
          return res.data;
        });
    },
    procesardevoluciones({}) {
      return axiosClient.get("/devoluciones/procesardevoluciones");
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
    rechazarOrdenDespacho({ commit }, id) {
      return axiosClient
        .get("/despachos/rechazarordendespacho/" + id)
        .then((res) => {
          return res.data;
        });
    },
    getReposicion({ commit }, fecha) {
      return axiosClient.get("/bodegas/getreposicion/" + fecha).then((res) => {
        return res.data;
      });
    },
    solicitardevolucion({ commit }, pedido) {
      commit("setDetallePedidoDevolucionLoading", true);
      return axiosClient
        .post("/devoluciones/detallepedidodevolucion", pedido)
        .then((res) => {
          commit("setDetallePedidoDevolucionLoading", false);
          commit("setDetallePedidoDevolucion", res.data);
          return res.data;
        });
    },
    enviarDevolucion({ commit }, devolucion) {
      return axiosClient
        .post("/devoluciones/enviardevolucion", devolucion)
        .then((res) => {
          return res.data;
        });
    },
    enviarAnulacion({ commit }, devolucion) {
        return axiosClient
          .post("/devoluciones/anulardevolucion", devolucion)
          .then((res) => {
            return res.data;
          })
    },
    detalleDevolucion({ commit }, devolucion) {
      commit("setDetalleDevolucionLoading", true);

      return axiosClient
        .post("/devoluciones/detalledevolucion", devolucion)
        .then((res) => {
          commit("setDetalleDevolucionLoading", false);
          commit("setDetalleDevolucion", res.data);
          return res;
        });
    },
    aprobarDevolucion({ commit, dispatch }, devolucion) {
      return axiosClient
        .post("/aprobaciones/aprobardevolucion", devolucion)
        .then((res) => {
          dispatch("verDevolucionesPorAprobar");
          return res;
        });
    },
    rechazarDevolucion({ commit, dispatch }, devolucion) {
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
    verDevolucionesPorRecibir({ commit }) {
      commit("setDevolucionesPorRecibirLoading", true);
      return axiosClient
        .get(
          "/devoluciones/verdevolucionesporrecibir/" +
            this.state.puntodeventaselect
        )
        .then((res) => {
          commit("setDevolucionesPorRecibir", res.data.devoluciones);
          commit("setDevolucionesPorRecibirLoading", false);
          return res;
        });
    },
    recibirDevolucion({ commit }, devolucion) {
      return axiosClient
        .post("/devoluciones/recibirdevolucion", devolucion)
        .then((res) => {
          return res.data;
        });
    },
    getNotificaciones({ commit }, devolucion) {
      commit("setNotificacionesLoading", true);
      return axiosClient
        .post("/consultas/notificaciones", devolucion)
        .then((res) => {
          commit("setNotificacionesLoading", false);
          commit("setNotificaciones", res.data.notificaciones);
        });
    },
    guiasProcesadas({ commit }) {
      commit("setGuiasProcesadasLoading", true);
      return axiosClient
        .get("/despachos/guiasprocesadas/" + this.state.puntodeventaselect)
        .then((res) => {
          commit("setGuiasProcesadasLoading", false);
          commit("setGuiasProcesadas", res.data);
        });
    },
  },
  mutations: {
    /* FUNCIONES EN INTERVALOS */
    setIntervalPedidosporAprobar(state, newInterval) {
      state.llenarpedidosporaprobar = newInterval;
    },
    llenarpedidosporaprobarStop(state) {
      clearInterval(state.llenarpedidosporaprobar);
    },

    setIntervalPedidosporAprobarCrediticios(state, newInterval) {
      state.llenarpedidosporaprobar_crediticios = newInterval;
    },
    llenarpedidosporaprobarcrediticiosStop(state) {
      clearInterval(state.llenarpedidosporaprobar_crediticios);
    },

    setIntervalBodegasDashboard(state, newInterval) {
      state.bodegasdashboard = newInterval;
    },
    bodegasDashboardStop(state) {
      clearInterval(state.bodegasdashboard);
    },
    setIntervalTransferenciasVenta(state, newInterval) {
      state.transferenciasdashboard = newInterval;
    },
    transferenciasVentaStop(state) {
      clearInterval(state.transferenciasdashboard);
    },
    setIntervalTransferenciasReposicion(state, newInterval) {
      state.reposiciondashboard = newInterval;
    },
    transferenciasReposicionStop(state) {
      clearInterval(state.reposiciondashboard);
    },
    /* FIN DE INTERVALOS */
    logout: (state) => {
      state.user.data = {};
      state.user.token = null;
      state.user.home = null;
      state.user.menu = [];
      state.currentCliente = null;
      state.currentSucursal = null;
      state.sucursal_facturacion_id = null;
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
    setCondicionPago: (state, cotizacion) => {
      state.condiciondepago_id = cotizacion.COND_ID;
      state.condiciondepago_print = cotizacion.COND_ID;
      sessionStorage.setItem("CONDICIONDEPAGOPRINT", cotizacion.COND_ID);
      state.formadepago_id = cotizacion.DESC_FORMA_PAGO_CODIGO;
    },
    setCondicionPagoSinPrint: (state, cotizacion) => {
      state.condiciondepago_id = cotizacion.COND_ID;
      sessionStorage.setItem("CONDICIONDEPAGOPRINT", cotizacion.COND_ID);
      state.formadepago_id = cotizacion.DESC_FORMA_PAGO_CODIGO;
    },
    setRegistroCopia: (state, registro_copia) => {
      state.registro_copia = registro_copia;
      sessionStorage.setItem("REGISTROCOPIA", registro_copia);
    },
    resetRegistroCopia: (state) => {
      state.registro_copia = null;
      sessionStorage.setItem("REGISTROCOPIA", null);
    },
    resetCurrentcliente: (state, cliente) => {
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

    setCurrentclienteCobro: (state, cliente) => {
      state.currentClienteCobro = cliente;
      state.cobranza.cliente_id = cliente.id;
    },
    setCurrentclienteDevolucion: (state, cliente) => {
      state.currentClienteDevolucion = cliente;
    },
    nullCurrentcliente: (state) => {
      state.currentCliente = null;
    },
    setNuevadireccion: (state) => {
      state.nuevadireccion = {
        CLI_SUC_RUC: state.currentCliente.CLI_RUC,
        CLI_SUC_DESCRIPCION: state.currentCliente.CLI_RAZON_SOCIAL,
        CLI_SUC_ID_DIRECCION: null,
        CLI_SUC_DIRECCION: "",
        CLI_SUC_CONTACTO: state.currentCliente.CLI_CONTACTO,
        CLI_SUC_REFERENCIA: "",
        CLI_SUC_VENDEDOR: state.currentCliente.CLI_VENDEDOR,
        CLI_SUC_TERRITORIO: "COSTA",
        CLI_SUC_CIUDAD: "",
        CLI_SUC_PROVINCIA: "",
        CLI_SUC_PAIS: "Ecuador",
        CLI_SUC_TELEFONO: "",
        CLI_SUC_CORREO_ELECTRONICO_SRI:
          state.currentCliente.CLI_CORREO_ELECT_SRI,
      };
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
      state.bodegas = userData.puntodeventaselect.bodegas;
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
    },
    setSeccionesLoading: (state, loading) => {
      state.sections.loading = loading;
    },
    setPerfilesLoading: (state, loading) => {
      state.perfiles.loading = loading;
    },
    setPerfiles: (state, perfiles) => {
      state.perfiles.data = perfiles;
    },
    setArticuloLoading: (state, loading) => {
      state.articulos.loading = loading;
    },
    setArticulo: (state, articulos) => {
      state.articulos.data = articulos;
    },
    resetArticulo: (state) => {
      state.articulos.data = [];
    },
    setClientesLoading: (state, loading) => {
      state.clientes.loading = loading;
    },
    setClientes: (state, clientes) => {
      state.clientes.data = clientes;
    },
    resetClientes: (state) => {
      state.clientes.data = [];
    },
    setCupoCliente: (state, cliente) => {
      state.clientes.data.suspendido = cliente.suspendido;
      state.clientes.data.cupo_disponible = cliente.cupo_disponible;
      state.clientes.data.cupo_asignado = cliente.cupo_asignado;

      state.currentCliente = cliente;
      sessionStorage.setItem("CURRENTCLIENTE", JSON.stringify(cliente));
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
    getCotizacion: (state, articulos) => {
      state.cotizacion.data = articulos;
    },
    resetCotizacion: (state) => {
      state.currentCliente = null;
      state.currentSucursal = null;
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
    limpiarBusqueda: (state) => {
      state.buscar_articulo = {
        select_codigo: "empieza",
        text_codigo: "",
        codigo3l: "",
        terminal: "",
        select_nombre: "contiene",
        text_nombre: "",
      };
    },
    encerapedidosycotizaciones: (state) => {
      state.pedidos.data = [];
      state.cotizaciones.data = [];
    },
    setVerActiculos: (state, value) => {
      console.log(value);
      state.verarticulos = value;
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
      state.pedidos.data = pedidos;
    },
    setDevoluciones: (state, devoluciones) => {
      state.devoluciones.data = devoluciones;
    },
    setPedidosCrediticiosLoading: (state, value) => {
      state.pedidos_crediticios.loading = value;
    },
    setPedidosCrediticios: (state, pedidos) => {
      state.pedidos_crediticios.data = pedidos;
    },
    setDevolucionesPorAprobarLoading: (state, estado) => {
      state.devoluciones_por_aprobar.loading = estado;
    },
    setDevolucionesPorAprobar: (state, devoluciones) => {
      state.devoluciones_por_aprobar.data = devoluciones;
    },
    setDevolucionesPorRecibirLoading: (state, estado) => {
      state.devoluciones_por_recibir.loading = estado;
    },
    setDevolucionesPorRecibir: (state, devoluciones) => {
      state.devoluciones_por_recibir.data = devoluciones;
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
    setDescuentoArticuloInicial: (state, formadepago_id) => {
      const restardescuento = state.formadepago.find(
        (item) => item.DESC_FORMA_PAGO_CODIGO === formadepago_id
      ).DESC_FORMA_PAGO_PORCENTAJE_REBAJAR;
      state.descuentooriginal =
        parseFloat(state.currentCliente.CLI_DSTO_COMERCIAL) +
        parseFloat(restardescuento);
      state.descuentoarticulo =
        parseFloat(state.currentCliente.CLI_DSTO_COMERCIAL) +
        parseFloat(restardescuento);
    },
    setDescuentoOriginal: (state, value) => {
      state.descuentooriginal = value;
    },
    setVerProveedor: (state, value) => {
      state.verproveedor = value;
    },
    setIndexProveedor: (state, value) => {
      state.indexproveedor = value;
    },
    setDetallePedido: (state, data) => {
      state.detallepedido.data = data.detalle;
      state.ordendecompra = data.ordendecompra;
      state.traslados = data.traslados;
      state.orden_despacho = data.orden_despacho;
      state.guias_remision = data.guias_remision;
      state.pendientes = data.pendientes;
      state.existentes = data.existentes;
      state.devoluciones_pedido = data.devoluciones;
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
      if (tiene_despacho && sin_despacho) {
        state.despacho_parcial = true;
      } else {
        state.despacho_parcial = false;
      }
    },
    setFacturarExistente: (state, data) => {
      state.facturar_existente = data.facturar_existente;
    },
    setFacturarDespachado: (state, data) => {
      state.facturar_despachado = data.facturar_despachado;
    },
    setDetalleCotizacionLoading: (state, loading) => {
      state.detallecotizacion.loading = loading;
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
    setFacturasLoading: (state, loading) => {
      state.facturas.loading = loading;
    },
    setFacturas: (state, data) => {
      state.facturas.data = data.facturas;
      state.facturas_retenciones.data = data.facturas_retenciones;
      state.bancos_tuval = data.bancos_tuval;
      state.bancos_cliente = data.bancos_cliente;
      state.bancos_tarjetas = data.bancos_tarjetas;
      state.cobros_sin_aplicar = data.cobros_sin_aplicar;
      state.pedidos_por_cobrar = data.pedidos_por_cobrar;
    },
    setCobrosRegistrados: (state, data) => {
      state.cobros_registrados = data.cobros_registrados;
    },
    setCobrosRegistradosLoading: (state, data) => {
      state.cobros_registrados_loading = data;
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
    setOrdenDespachoLoading: (state, data) => {
      state.ordenes_despacho[data.index].loading = data.value;
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
    enceraRetencion: (state) => {
      state.ret_selected = null;
      state.nuevaRetencion = {
        ret_factura_index: "",
        ret_factura: "",
        ret_fecha_emision: "",
        ret_fecha_vencimiento: "",
        ret_original_factura: "",
        ret_subtotal_factura: "",
        ret_saldo_factura: "",
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
      };
    },
    asignaRetencion: (state, retencion) => {
      state.nuevaRetencion = {
        ret_factura_index: retencion.index,
        ret_factura: retencion.ECD_DET_NUM_DOC,
        ret_fecha_emision: retencion.ECD_DET_FECHA_EMISION,
        ret_fecha_vencimiento: retencion.ECD_DET_FECHA_VENCIMIENTO,
        ret_original_factura: retencion.ECD_DET_MONTO_ORIGINAL,
        ret_subtotal_factura: retencion.ECD_DET_SUBTOTAL,
        ret_saldo_factura: retencion.ECD_DET_SALDO_CLIENTE,
        ret_iva_factura: retencion.ECD_DET_IVA,
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
      };
      state.ret_selected = null;
    },
    enceraCobranzas: (state) => {
      state.cobranza = {
        retenciones: [],
        ingreso_efectivo: {},
        ingreso_tarjeta: {},
        ingreso_depositos: [],
        ingreso_aplicaciones: [],
        ingreso_cheques: {},
        referencia: "",
      };
      state.ingreso_efectivo = {
        monto: "",
        monto_original: "",
        efectivo_recibido: "",
        monto_no_aplicado: 0.0,
        monto_aplicado: 0.0,
        facturas: [],
      };
      state.ingreso_tarjeta = {
        monto: "",
        monto_original: "",
        monto_no_aplicado: 0.0,
        monto_aplicado: 0.0,
        facturas: [],
      };
      state.ingreso_deposito = {
        tipo: "",
        banco: "",
        banco_nombre: "",
        dep_comprobante: "",
        dep_fecha: "",
        monto: "",
        monto_original: "",
        monto_no_aplicado: 0.0,
        monto_aplicado: 0.0,
        facturas: [],
      };
      state.ingreso_aplicacion = {
        cobro: "",
        detalle: {},
        comentario: "",
        monto: "",
        monto_original: "",
        monto_no_aplicado: 0.0,
        monto_aplicado: 0.0,
        facturas: [],
      };
      state.ingreso_cheque = {
        banco: "",
        cuenta: "",
        cheque: "",
        monto: "",
        comentario: "",
        fecha_emision:
          state.today.getFullYear() +
          "-" +
          (state.today.getMonth() + 1) +
          "-" +
          state.today.getDate(),
        fecha_vencimiento: "",
        monto_original: "",
        monto_no_aplicado: 0.0,
        monto_aplicado: 0.0,
        cheques: [],
        facturas: [],
      };
    },
    enceraEfectivo: (state) => {
      state.cobranza.ingreso_efectivo = {};
    },
    enceraTarjeta: (state) => {
      state.cobranza.ingreso_tarjeta = {};
    },
    eliminarDeposito: (state, index) => {
      state.cobranza.ingreso_depositos.splice(index, 1);
    },
    eliminarAplicacion: (state, index) => {
      state.cobranza.ingreso_aplicaciones.splice(index, 1);
    },
    eliminarcobroCheques: (state) => {
      state.cobranza.ingreso_cheques = {};
    },
    eliminarCheque: (state, index) => {
      state.ingreso_cheque.cheques.splice(index, 1);
    },
    enceraDeposito: (state) => {
      state.ingreso_deposito = {
        tipo: "",
        banco: "",
        banco_nombre: "",
        dep_comprobante: "",
        dep_fecha: "",
        monto: "",
        monto_original: "",
        monto_no_aplicado: 0.0,
        monto_aplicado: 0.0,
        facturas: [],
      };
    },
    enceraAplicacion: (state) => {
      state.ingreso_aplicacion = {
        cobro: "",
        detalle: {},
        comentario: "",
        monto: "",
        monto_original: "",
        monto_no_aplicado: 0.0,
        monto_aplicado: 0.0,
        facturas: [],
      };
    },
    enceraCheque: (state) => {
      state.ingreso_cheque = {
        banco: "",
        cuenta: "",
        cheque: "",
        monto: "",
        comentario: "",
        fecha_emision:
          state.today.getFullYear() +
          "-" +
          (state.today.getMonth() + 1) +
          "-" +
          state.today.getDate(),
        fecha_vencimiento: "",
        monto_original: "",
        monto_no_aplicado: 0.0,
        monto_aplicado: 0.0,
        cheques: [],
        facturas: [],
      };
    },
    calculaSaldoFacturas: (state) => {
      state.ingreso_efectivo.monto_aplicado = 0;
      state.ingreso_efectivo.monto_no_aplicado = parseFloat(
        state.ingreso_efectivo.monto
      );

      state.ingreso_tarjeta.monto_aplicado = 0;
      state.ingreso_tarjeta.monto_no_aplicado = parseFloat(
        state.ingreso_tarjeta.monto
      );

      state.ingreso_deposito.monto_aplicado = 0;
      state.ingreso_deposito.monto_no_aplicado = parseFloat(
        state.ingreso_deposito.monto
      );

      state.ingreso_aplicacion.monto_aplicado = 0;
      state.ingreso_aplicacion.monto_no_aplicado = parseFloat(
        state.ingreso_aplicacion.monto
      );

      state.ingreso_cheque.monto_aplicado = 0;
      state.ingreso_cheque.monto_original = parseFloat(0);
      state.ingreso_cheque.monto_no_aplicado = parseFloat(0);

      state.ingreso_cheque.cheques.map((cheque) => {
        state.ingreso_cheque.monto_no_aplicado += parseFloat(cheque.monto);
        state.ingreso_cheque.monto_original += parseFloat(cheque.monto);
      });

      state.facturas.data.map((factura) => {
        factura.ECD_DET_SALDO_CLIENTE = factura.ECD_DET_SALDO;

        state.cobranza.retenciones.map((retencion) => {
          if (factura.ECD_DET_NUM_DOC === retencion.ret_factura) {
            factura.ECD_DET_SALDO_CLIENTE = parseFloat(
              factura.ECD_DET_SALDO - retencion.total
            ).toFixed(2);
          }
        });

        if (
          factura.aplicar_monto_efectivo &&
          factura.aplicar_monto_efectivo > 0
        ) {
          factura.ECD_DET_SALDO_CLIENTE = (
            parseFloat(factura.ECD_DET_SALDO_CLIENTE) -
            parseFloat(factura.aplicar_monto_efectivo)
          ).toFixed(2);
          state.ingreso_efectivo.monto_aplicado += parseFloat(
            factura.aplicar_monto_efectivo
          );
          state.ingreso_efectivo.monto_no_aplicado -= parseFloat(
            factura.aplicar_monto_efectivo
          ).toFixed(2);
        }

        if (
          factura.aplicar_monto_tarjeta &&
          factura.aplicar_monto_tarjeta > 0
        ) {
          factura.ECD_DET_SALDO_CLIENTE = (
            parseFloat(factura.ECD_DET_SALDO_CLIENTE) -
            parseFloat(factura.aplicar_monto_tarjeta)
          ).toFixed(2);
          state.ingreso_tarjeta.monto_aplicado += parseFloat(
            factura.aplicar_monto_tarjeta
          );
          state.ingreso_tarjeta.monto_no_aplicado -= parseFloat(
            factura.aplicar_monto_tarjeta
          ).toFixed(2);
        }

        if (
          factura.aplicar_monto_deposito &&
          factura.aplicar_monto_deposito > 0
        ) {
          state.ingreso_deposito.monto_aplicado += parseFloat(
            factura.aplicar_monto_deposito
          );
          state.ingreso_deposito.monto_no_aplicado -= parseFloat(
            factura.aplicar_monto_deposito
          ).toFixed(2);
        }

        factura.ECD_DET_SALDO_CLIENTE = parseFloat(
          factura.ECD_DET_SALDO_CLIENTE
        );
        state.cobranza.ingreso_depositos.map((deposito) => {
          deposito.facturas.map((fac_deposito) => {
            if (factura.ECD_DET_NUM_DOC === fac_deposito.ECD_DET_NUM_DOC) {
              factura.ECD_DET_SALDO_CLIENTE -= parseFloat(
                fac_deposito.aplicar_monto_deposito
              ).toFixed(2);
            }
          });
        });

        if (
          factura.aplicar_monto_aplicacion &&
          factura.aplicar_monto_aplicacion > 0
        ) {
          state.ingreso_aplicacion.monto_aplicado += parseFloat(
            factura.aplicar_monto_aplicacion
          );
          state.ingreso_aplicacion.monto_no_aplicado -= parseFloat(
            factura.aplicar_monto_aplicacion
          ).toFixed(2);
        }

        factura.ECD_DET_SALDO_CLIENTE = parseFloat(
          factura.ECD_DET_SALDO_CLIENTE
        );
        state.cobranza.ingreso_aplicaciones.map((aplicacion) => {
          aplicacion.facturas.map((fac_aplicacion) => {
            if (factura.ECD_DET_NUM_DOC === fac_aplicacion.ECD_DET_NUM_DOC) {
              factura.ECD_DET_SALDO_CLIENTE -= parseFloat(
                fac_aplicacion.aplicar_monto_aplicacion
              ).toFixed(2);
            }
          });
        });

        if (factura.aplicar_monto_cheque && factura.aplicar_monto_cheque > 0) {
          factura.ECD_DET_SALDO_CLIENTE = (
            parseFloat(factura.ECD_DET_SALDO_CLIENTE) -
            parseFloat(factura.aplicar_monto_cheque)
          ).toFixed(2);
          state.ingreso_cheque.monto_aplicado += parseFloat(
            factura.aplicar_monto_cheque
          );
          state.ingreso_cheque.monto_no_aplicado -= parseFloat(
            factura.aplicar_monto_cheque
          ).toFixed(2);
        }
      });
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
      state.transferencias_venta = data.bodegas;
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
      // data.recibos.map( recibo => {
      //     recibo.detalle.map( articulo => {
      //         articulo.compartimiento = articulo.compartimientos[0].Compartimento;
      //     });
      // });

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
    checkPermitePedido: (state) => {
      let existen = false;

      if (
        (state.cobranza.ingreso_efectivo.facturas &&
          state.cobranza.ingreso_efectivo.facturas.length) ||
        (state.cobranza.ingreso_tarjeta.facturas &&
          state.cobranza.ingreso_tarjeta.facturas.length) ||
        (state.cobranza.ingreso_cheques.facturas &&
          state.cobranza.ingreso_cheques.facturas.length)
      ) {
        existen = true;
      }

      state.cobranza.ingreso_depositos.map((deposito) => {
        if (deposito.facturas.length) {
          existen = true;
        }
      });

      state.cobranza.ingreso_aplicaciones.map((aplicacion) => {
        if (aplicacion.facturas.length) {
          existen = true;
        }
      });
      state.permite_pedido = !existen;
      state.pago_a_padido = null;
    },
    resetPagoaPedido: (state) => {
      state.pago_a_padido = null;
    },
    setDespacho: (state, value) => {
      state.despacho = value;
    },
    setNotificaciones: (state, value) => {
      state.notificaciones.data = value;
    },
    setNotificacionesLoading: (state, value) => {
      state.notificaciones.loading = value;
    },
    setGuiasProcesadas: (state, value) => {
      state.guiasprocesadas.data = value;
    },
    setGuiasProcesadasLoading: (state, value) => {
      state.guiasprocesadas.loading = value;
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
      state.sucursales_facturacion = state.clientes_devolucion.find(
        (item) => item.id === state.devolucion.cliente_volver_a_facturar_id
      ).sucursales;
    },
    setFiltrarCliente: (state, value) => {
      state.filtrar_cliente = value;
    },
    resetFiltrarCliente: (state) => {
      state.filtrar_cliente = null;
    },
  },
  modules: {},
});

export default store;
