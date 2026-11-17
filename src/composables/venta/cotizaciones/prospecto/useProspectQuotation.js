import { ref, reactive, computed, watch } from "vue";

import { useRouter } from "vue-router";
import { useStore } from "vuex";

import { useBootstrapModal } from "@/composables/core/useBootstrapModal";
import { useQuoteProspectActions } from "@/composables/venta/cotizaciones/prospecto/useQuoteProspectActions";
import { useSearchConditionPayment } from "@/composables/venta/cotizaciones/crearCotizacion/useSearchConditionPayment";
import { useCustomerCreate } from "@/composables/venta/cliente/useCustomerCreate";
import { swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";

import useVuelidate from "@vuelidate/core";
import { required, maxLength } from "@vuelidate/validators";

import { useDispatchTypeActions } from "@/composables/sistemas/mantenimientos/tipo-despachos/useDispatchTypeActions";

export function useProspectQuotation() {
  const gallery = reactive({
    visible: false,
    index: 0,
    photos: [],
  });

  function showPhoto(imagenes) {
    gallery.index = 0;
    gallery.visible = true;
    gallery.photos = imagenes;
  }

  // Helper function to hide the lightbox
  function handleHide() {
    gallery.visible = false;
  }

  const store = useStore();

  const router = useRouter();

  const initialProspect = () => ({ id: null, CLI_RUC: "", CLI_RAZON_SOCIAL: "", CLI_CORREO_ELECT_SRI: "", CLI_DIRECCION: "", CLI_TELEFONO_1: "", CLI_DSTO_COMERCIAL: 25, CLI_CONDICION_PAGO: "CONTADO" });
  const nuevoProspecto = ref(initialProspect());
  const despacho = ref("Retiro en bodega");
  const bodegas = computed(() => store.state.bodegas || []);
  const bodegaFacturacion = ref(bodegas.value[0]?.PTO_VTA_BOD_REL_BODEGA ?? null);
  const bodega_selected = computed(() => bodegas.value.find(item => item.PTO_VTA_BOD_REL_BODEGA === bodegaFacturacion.value));
  const cotizacion = ref({ data: [], loading: false });
  const saving = ref(false);
  const { fetchTypeDispatchesResponsible, typeDispatchesResponsible } = useDispatchTypeActions();
  const tipoDespachoId = computed(() => typeDispatchesResponsible.value.find(item => item.descripcion === despacho.value)?.id ?? null);
  watch(bodega_selected, () => {
    if (!bodega_selected.value?.PERMITE_DESPACHO) despacho.value = "Retiro en bodega";
  });
  watch(() => store.state.puntoventaselectid, () => {
    limpiarCotizacion();
    typeDispatchesResponsible.value = [];
  }, { flush: "sync" });
  const COMMERCIAL_DISCOUNT = 25;
  const condiciondepago_id = "CONTADO";
  const { fetchMethodPayment, methodPayment } = useSearchConditionPayment();
  const cashPayment = computed(() => (methodPayment.value || []).find(payment =>
    ["CONTADOEFECTIVO", "EFECTIVO"].includes(
      String(payment.tipo).toUpperCase().replace(/[\s-]+/g, "")
    )
  ));
  const formadepago_id = computed(() => cashPayment.value?.codigo);
  const descuentoarticulo = computed(() => COMMERCIAL_DISCOUNT +
    Number(cashPayment.value?.porcentaje_rebaja || 0));
  let pendingPaymentRequest = null;
  const descuentooriginal = descuentoarticulo;
  const subtotal = ref(0);
  const peso = ref(0);
  const descuento = ref(0);
  const iva = ref(0);
  const total = ref(0);
  const orden_de_compra = ref("");
  const nota_interna = ref("");
  const nota_cliente = ref("");

  let articuloModal = ref(null);
  const dataSearchItem = ref(null);
  const articuloModalObj = useBootstrapModal(articuloModal, {
    onHidden: () => {
      dataSearchItem.value = null;
    },
  });
  const { fetchDefaultPriceListBySalesPoint, restoreProspect, saveProspectQuotation } = useQuoteProspectActions();
  const { validateIdentification, validateProspectIdentification } = useCustomerCreate();
  let documentCheckSequence = 0;
  let checkedDocument = null;
  let pendingDocumentCheck = null;
  watch(() => nuevoProspecto.value.CLI_RUC, () => {
    checkedDocument = null;
    pendingDocumentCheck = null;
    documentCheckSequence++;
  }, { flush: "sync" });
  const max_length = ref(20);

  async function checkRuc() {
    const documento = String(nuevoProspecto.value.CLI_RUC).trim();
    if (checkedDocument === documento) return true;
    if (pendingDocumentCheck?.documento === documento) {
      return pendingDocumentCheck.promise;
    }
    const sequence = ++documentCheckSequence;
    const promise = validateDocumentForQuotation(documento, sequence);
    pendingDocumentCheck = { documento, promise };
    try {
      const valid = await promise;
      if (valid && sequence === documentCheckSequence) checkedDocument = documento;
      return valid;
    } finally {
      if (pendingDocumentCheck?.promise === promise) pendingDocumentCheck = null;
    }
  }

  async function validateDocumentForQuotation(documento, sequence) {
    const isCurrent = () => sequence === documentCheckSequence &&
      documento === String(nuevoProspecto.value.CLI_RUC).trim();
    if (!await v$.value.CLI_RUC.$validate() || !documento) return;

    const clientResponse = await validateIdentification(documento);
    if (!isCurrent()) return;
    if (!clientResponse.ok) {
      // Los errores de transporte no confirman la existencia de un cliente.
      if (clientResponse.raw?.isAxiosError || clientResponse.canceled) {
        swalWarning(clientResponse.message);
        return;
      }
      swalWarning(clientResponse.message);
      await router.push({
        name: "ventas-crearcotizacion",
        query: { cliente_nuevo: documento },
      });
      return;
    }

    const prospectValidation = await validateProspectIdentification(documento, { showError: false });
    if (!isCurrent()) return;
    // true permite crear uno nuevo; false indica que el prospecto ya existe.
    if (prospectValidation.ok) return true;
    if (prospectValidation.raw?.isAxiosError || prospectValidation.canceled) {
      swalWarning(prospectValidation.message);
      return;
    }

    const response = await restoreProspect(documento);
    if (!isCurrent()) return;
    if (!response.ok) {
      swalWarning(response.message);
      return;
    }
    const prospect = response.data;
    if (!prospect?.identificacion) return;
    nuevoProspecto.value.CLI_RAZON_SOCIAL = prospect.razon_social;
    nuevoProspecto.value.CLI_CORREO_ELECT_SRI = prospect.correo_sri;
    nuevoProspecto.value.CLI_TELEFONO_1 = prospect.telefono1;
    nuevoProspecto.value.CLI_DIRECCION = prospect.direcciones[0]?.direccion ?? "";
    return true;
  }

  function updateCantidad(event, articulo, index) {
    const qty = Number(event.target.value);
    const decimals = Number(articulo.ART_DECIMAL_CANTIDAD || 0);
    articulo.errorCantidad = !Number.isFinite(qty) || qty <= 0 || Math.abs(qty - Number(qty.toFixed(decimals))) > 0.0000001;
    cotizacion.value.data[index].ART_CANTIDAD = event.target.value;
    calcTotales();
    if (articulo.errorCantidad) swalWarning(`Ingrese una cantidad positiva con hasta ${decimals} decimales.`);
  }

  function confirmeliminarArticulo(articulo, index) {
    toast
      .fire({
        title: "Estás seguro?",
        text: "De eliminar el producto " + articulo.ART_CODIGO + "",
        icon: "warning",
        showCancelButton: true,
        customClass: {
          confirmButton: "btn btn-danger m-1",
          cancelButton: "btn btn-secondary m-1",
        },
        confirmButtonText: "Si, eliminarlo!",
        html: false,
        preConfirm: () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 50);
          });
        },
      })
      .then((result) => {
        if (result.value) {
          eliminarArticulo(index);
        }
      });
  }

  async function eliminarArticulo(index) {

    cotizacion.value.data.splice(index, 1);
    calcTotales();
  }
  async function buscararticulo() {
    if (!await validateCashPayment()) return;
    const resp = await fetchDefaultPriceListBySalesPoint();
    if (!resp?.ok) {
      const message = resp?.message || "No se pudo obtener la lista de precio por defecto";
      (resp?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
      return;
    }

    dataSearchItem.value = {
      cliente: {
        id: null,
        CLI_NIVEL_PRECIO: resp.data?.listaPrecio || "",
        CLI_DSTO_COMERCIAL: COMMERCIAL_DISCOUNT,
      },
      direccion_facturacion_id: null,
    };
    articuloModalObj.show();
  }

  function closeModalSearchItem() {
    articuloModalObj.hide();
  }

  async function handleItemSelected(articulo) {
    if (!await validateCashPayment()) return;
    if (articulo.ART_TIPO_COMPRA === "L") {
      articulo.ART_STOCK = 0;
      articulo.stock = [];
    }

    articulo.ART_CANTIDAD = 0;

    const item = { ...articulo, orden: `${Date.now()}-${Math.random()}`, precio_sin_flete: articulo.ART_VALOR, fle_valor: 0 };
    if (item.ART_CLASE_ARTICULO === "VTA-SERV") item.ART_TIPO_COMPRA = "SERV";
    cotizacion.value.data.push(item);
    applyDefaultDiscount();
    calcTotales();
  }

  async function validateCashPayment() {
    if (!cashPayment.value) {
      if (!pendingPaymentRequest) {
        pendingPaymentRequest = fetchMethodPayment(condiciondepago_id)
          .finally(() => { pendingPaymentRequest = null; });
      }
      const response = await pendingPaymentRequest;
      if (!response.ok) {
        swalWarning(response.message || "No se pudieron cargar las formas de pago.");
        return false;
      }
    }
    if (formadepago_id.value == null || String(formadepago_id.value).trim() === "") {
      swalWarning("No se encontró la forma de pago Contado-Efectivo en el catálogo.");
      return false;
    }
    return true;
  }

  function applyDefaultDiscount() {
    nuevoProspecto.value.CLI_DSTO_COMERCIAL = COMMERCIAL_DISCOUNT;
    nuevoProspecto.value.CLI_CONDICION_PAGO = condiciondepago_id;

    cotizacion.value.data.forEach(articulo => {
      articulo.descuento_original = descuentooriginal.value;
      articulo.descuento = descuentoarticulo.value;
    });
  }

  let validaCantidad = ref(true);

  function redondear(num, decimales = 2) {
    const factor = Math.pow(10, decimales);
    return Math.round((num + Number.EPSILON) * factor) / factor;
  }

  const calcTotales = () => {
    let tempSubtotal = 0;
    let tempDiscount = 0;
    let tempIva = 0;
    let tempPeso = 0;
    subtotal.value = 0;
    descuento.value = 0;
    iva.value = 0;
    total.value = 0;
    peso.value = 0;
    validaCantidad.value = true;
    cotizacion.value.data.forEach((articulo) => {
      const qty = Number.parseFloat(articulo.ART_CANTIDAD) || 0;
      const ivaPorcentaje = Number.parseFloat(articulo.ART_IMP_VTA) || 0;
      const tipoCompra = (articulo.ART_TIPO_COMPRA || '').trim().toUpperCase();
      if (tipoCompra != 'L') {
        let unitPrice = Number.parseFloat(articulo.ART_VALOR_ORIGINAL || 0);
        const modifier = Number.parseFloat(articulo.modificador || 0);
        let priceCalculated = unitPrice + (unitPrice * modifier / 100);
        const diference = Math.abs(priceCalculated - Number.parseFloat(articulo.ART_VALOR || 0));
        if (!articulo.cambiar_valor) {
          if (diference < 0.001) {
            articulo.ART_VALOR = redondear(articulo.ART_VALOR, 4);
          } else {
            articulo.ART_VALOR = redondear(priceCalculated, 4);
          }
        }
      }

      const priceCaculated = articulo.ART_VALOR;
      const discountPorcentil = Number.parseFloat(articulo.descuento);
      const discountAmount = priceCaculated * (discountPorcentil / 100);

      articulo.ART_DESCUENTO = redondear(discountAmount + 0.000001, 4);
      const priceWithDiscount = priceCaculated - discountAmount;
      const subtotalLine = redondear((priceWithDiscount * qty) + 0.000001, 4);

      articulo.subtotal = subtotalLine;
      tempSubtotal += subtotalLine;
      tempDiscount += (discountAmount * qty);

      const ivaLinea = subtotalLine * (ivaPorcentaje / 100);
      articulo.ART_IVA = redondear(ivaLinea + 0.000001, 2); //se aplico por bloque de seguridad
      tempIva += ivaLinea;

      if (!Number.isFinite(Number(articulo.ART_CANTIDAD)) || Number(articulo.ART_CANTIDAD) <= 0 || articulo.errorCantidad) {
        validaCantidad.value = false;
      }

      articulo.precio_sin_flete = articulo.ART_VALOR;

      tempPeso += (Number.parseFloat(articulo.ART_PESO) || 0) * qty;
    });
    peso.value = redondear(tempPeso + 0.000001, 2);
    descuento.value = redondear(tempDiscount + 0.000001, 2);
    subtotal.value = redondear(tempSubtotal + 0.000001, 2);
    iva.value = redondear(tempIva + 0.000001, 2);
    total.value = redondear((subtotal.value + iva.value) + 0.000001, 2);
  }

  function limpiarCotizacion() {
    cotizacion.value.data = [];
    nuevoProspecto.value = initialProspect();
    despacho.value = "Retiro en bodega";
    bodegaFacturacion.value = bodegas.value[0]?.PTO_VTA_BOD_REL_BODEGA ?? null;
    orden_de_compra.value = nota_interna.value = nota_cliente.value = "";
    calcTotales();
    v$.value.$reset();
  }

  const rules = computed(() => {
    return {
      CLI_RUC: {
        required,
        maxLength: maxLength(15),
      },
      CLI_RAZON_SOCIAL: {
        required,
        maxLength: maxLength(65),
      },
      CLI_TELEFONO_1: {
        maxLength: maxLength(21),
      },
    };
  });
  const v$ = useVuelidate(rules, nuevoProspecto);

  async function guardarCotizacion() {
    if (saving.value) return;
    saving.value = true;
    try {
      if (!await validateCashPayment()) return;
      applyDefaultDiscount();
      calcTotales();
      if (!await v$.value.$validate()) {
        swalWarning("Revise la identificación y los datos del prospecto.");
        return;
      }
      if (!await checkRuc()) return;
      if (!cotizacion.value.data.length || !validaCantidad.value || !bodega_selected.value) {
        swalWarning("Seleccione una bodega y agregue artículos con cantidades válidas.");
        return;
      }
      if (!tipoDespachoId.value) {
        const response = await fetchTypeDispatchesResponsible('tuval');
        if (!response.ok || !tipoDespachoId.value) {
          swalWarning(response.ok ? "No se encontró el tipo de despacho seleccionado." : response.message);
          return;
        }
      }
      const response = await saveProspectQuotation({
        prospecto: { ...nuevoProspecto.value },
        pv_id: store.state.puntoventaselectid,
        PTO_VTA_ID: store.state.puntodeventaselect,
        bodega_facturacion: bodegaFacturacion.value,
        tipo_despacho_id: tipoDespachoId.value,
        despacho: despacho.value,
        porcentage_descuentooriginal: descuentooriginal.value,
        porcentage_descuento: descuentoarticulo.value,
        DESC_FORMA_PAGO_CODIGO: formadepago_id.value,
        cotizacion: cotizacion.value.data,
        peso: peso.value,
        nota_interna: nota_interna.value,
        nota_cliente: nota_cliente.value,
        orden_de_compra: orden_de_compra.value,
      });
      if (!response.ok) {
        swalWarning(response.message);
        return;
      }
      swalSuccess(response.message);
      await router.push({ name: "ventas-cotizaciones" });
    } finally {
      saving.value = false;
    }
  }

  return { nuevoProspecto, despacho, bodegas, bodega_selected, bodegaFacturacion, cotizacion, subtotal, descuento, iva, total, peso, orden_de_compra, nota_interna, nota_cliente, condiciondepago_id, max_length, v$, gallery, showPhoto, handleHide, articuloModal, dataSearchItem, closeModalSearchItem, handleItemSelected, buscararticulo, updateCantidad, confirmeliminarArticulo, limpiarCotizacion, guardarCotizacion, checkRuc, validaCantidad, saving };
}
