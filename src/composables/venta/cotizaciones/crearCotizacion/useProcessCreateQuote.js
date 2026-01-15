import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ref, reactive, watch, computed, onMounted, toRef } from "vue";
import { swalError, swalWarning, swalSuccess } from "@/functions/swal-alert";
import { useSessionStorage } from '@vueuse/core';
import { useStore } from 'vuex'

const initialState = {
    cotizacion_id: null,
    bodega_facturacion: null,
    cliente: null,
    sucursal: null,
    //variables de fecha y direccion de facturacion
    tipo_entrega: 'retiro',  //despacho
    fecha_entrega: null,
    direccion_facturacion_id: null,
    direccion_entrega_id: null,

    // variables de facturacion posterior (Booleanos)
    factura_posterior_despacho: false,
    factura_a_demanda: false,
    factura_siguiente_mes: false,
    alerta_facturar: '',
    pregunta_facturar: false,
    facturar_ahora: false,

    //forma de pago 
    condicion_pago_id: null,
    forma_pago_id: null,


    //descuentos
    descuento_articulo: 0,
    descuento_original: 0,

    //notas
    nota_interna: '',
    nota_cliente: '',
    orden_de_compra: '',


    //registro copia
    registro_copia: false,

    //calculos
    subtotal: 0,
    peso: 0,
    descuento: 0,
    iva: 0,
    total: 0,

    //items de cotizacion
    items: [],

}
export function useProcessCreateQuote() {
    const store = useStore();
    const ptoVtaSelect = store.state.puntodeventaselect;
    const { run } = useApiAction();
    const loadingCreate = ref(false);
    const apiCreateQuote = '/cotizaciones/crear-cotizacion';
    const form = useSessionStorage('quoteTemp_v1', { ...initialState });
    const today = new Date();


    //validadores maximos para notas
    const maxLength = 200;
    const maxLengthNote = 300;
    const maxOrder = 20;


    function clearForm() {
        form.value = { ...initialState };
    }


    //watch para limpiar campos cuando cambia el tipo de entrega
    watch(
        () => form.value.tipo_entrega,
        (newVal) => {
            if (newVal === 'retiro') {
                form.value.direccion_entrega_id = null;
                form.value.fecha_entrega = null;
            }
        }
    );


    //validador de reglas de facturacion 
    function validateBillingRules() {
        form.value.factura_posterior_despacho = false;
        form.value.factura_a_demanda = false;
        form.value.factura_siguiente_mes = false;
        form.value.pregunta_facturar = false;
        form.value.alerta_facturar = '';

        const client = form.value.cliente;
        if (!client) return;

        const isPostDispatch = client.CLI_FACTURA_POSTERIOR_AL_DESPACHO === 'SI';
        const maxBillingDay = client.CLI_DIA_MAXIMO_MES_FACTURACION;
        const currentDay = today.getDate();

        if (isPostDispatch) {
            if (maxBillingDay === 1) {
                form.value.factura_posterior_despacho = true;
                form.value.factura_a_demanda = true;
                form.value.alerta_facturar = 'Factura a demanda posterior al despacho';
                return;
            }

            if (currentDay <= maxBillingDay) {
                form.value.factura_posterior_despacho = true;
                return;
            }
            form.value.factura_posterior_despacho = true;
            form.value.pregunta_facturar = true;
            form.value.factura_siguiente_mes = true;
        }
    }


    watch(
        () => form.value.cliente,
        () => {
            validateBillingRules();
        },
        { deep: true, immediate: true }
    );


    //proceso de agregar items a mi form-items y me crea el registro en las tablas temporales
    const apiAddItem = 'cart/item/add';
    const loadingAddItem = ref(false);
    const addItems = async (itm) => {
        const payloadAdddItem = {
            'cliente_id': form.value.cliente.id,
            'punto_venta_id': ptoVtaSelect,
            'sucursal_id': form.value.direccion_facturacion_id,
            'articulo': itm,
        }
        return await run(() => axiosClient.post(apiAddItem, payloadAdddItem), {
            loadingRef: loadingAddItem,
            onSuccess: (res) => {
                form.value.items.push(res);
            },
            successMessage: 'Proceso realizado exitosamente',
        });
    }

    const apiDeleteCart = 'cart/item/delete';
    const removeItem = async (row, i) => {
        if (form.value.items[i]) {
            form.value.items[i].disabled_delete = true;
        }
        return await run(() => axiosClient.delete(apiDeleteCart + `/${row.id}`), {
            loadingRef: loadingAddItem,
            onSuccess: () => {
                form.value.items.splice(i, 1);
            },
            onError: (error) => {
                // 3. ¡IMPORTANTE! Si falla, desbloqueamos el botón para que intente de nuevo
                console.error('Error al eliminar:', error);
                if (form.value.items[i]) {
                    form.value.items[i].disabled_delete = false;
                }
            },
            successMessage: 'Proceso realizado exitosamente',
        })
    }



    //proceso de cambio de descripcion de item 
    const getDescriptionClass = (ele) => {
        const isModified = ele.ART_DESCRIPCION !== ele.ART_DESCRIPCION_ORIGINAL;
        const isTypeL = ele.ART_TIPO_COMPRA === 'L';

        if ((isModified && !isTypeL) || (!isModified && isTypeL)) {
            return 'text-danger fw-bold';
        }
        return 'text-primary';
    }

    const isDescriptionEditable = (i) => {
        return form.value.items[i].cambiar_descripcion === true
    }

    const enableEditModeDescription = (i) => {
        form.value.items[i].cambiar_descripcion = true
    }


    const apiUpdateDescription = 'cart/item/update/descripcion';
    const loadingUpdateDescription = ref(false);
    async function updateDescripcion(event, row, i) {
        if (event.target.value.length < 5) {
            form.value.items[i].errorDescripcion = true;
            swalWarning('La descripcion debe tener al menos 5 caracteres');
            return;
        }
        let payloadUpdateDescription = {
            'id': row.id,
            'descripcion': event.target.value,
        }
        return await run(() => axiosClient.post(apiUpdateDescription, payloadUpdateDescription), {
            loadingRef: loadingUpdateDescription,
            onSuccess: (res) => {
                form.value.items[i].errorDescripcion = false;
                form.value.items[i].ART_DESCRIPCION = event.target.value;
                form.value.items[i].cambiar_descripcion = false;
            },
            onError: (error) => {
                form.value.items[i].errorDescripcion = false;
                form.value.items[i].ART_DESCRIPCION = form.value.items[i].ART_DESCRIPCION_ORIGINAL;
                form.value.items[i].cambiar_descripcion = false;
            },
            successMessage: 'Proceso realizado exitosamente',
        });
    }



    //proceso para listado de items alternativos 
    const descripcionAlternativa = ref('');
    const apiSearchAlternativesItems = '/cotizaciones/lista-items-alternativos';
    const listItemsAlternatives = ref([]);
    const loadingListAlternative = ref(false);
    async function getAlternativeDescriptions(artCode) {
        return await run(() => axiosClient.post(apiSearchAlternativesItems, { item: artCode }), {
            loadingRef: loadingListAlternative,
            onSuccess: (res) => {
                listItemsAlternatives.value = res;
            },
            successMessage: 'Proceso realizado exitosamente',
        });
    }

    async function clearSelectionItemalternative() {
        listItemsAlternatives.value = [];
    }




    //proceso de items alternativos
    const itemUpdateCheckbox = reactive({
        articulo: null,
        CHECK_ALTERNATIVO: false
    });


    const apiUpdateCheckAlternative = 'cart/item/actualizar/check-alternativo';
    const loadingUpdateCheckAlternative = ref(false);
    async function updateCheckAlternative() {
        return await run(() => axiosClient.post(apiUpdateCheckAlternative, itemUpdateCheckbox), {
            loadingRef: loadingUpdateCheckAlternative,
            successMessage: 'Proceso realizado exitosamente',
        });
    }


    return {
        form,
        clearForm,
        addItems,
        removeItem,

        //proceso de descripcion de item 
        getDescriptionClass,
        updateDescripcion,
        isDescriptionEditable,
        enableEditModeDescription,

        //proceso item alternativo 
        loadingListAlternative,
        getAlternativeDescriptions,
        listItemsAlternatives,
        clearSelectionItemalternative,
        descripcionAlternativa,

        //proceso de checkbox alternativos
        itemUpdateCheckbox,
        loadingUpdateCheckAlternative,
        updateCheckAlternative
    };


}