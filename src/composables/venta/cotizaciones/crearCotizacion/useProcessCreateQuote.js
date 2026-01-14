import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ref, reactive, watch, computed, onMounted } from "vue";
import { swalError } from "@/functions/swal-alert";
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
    nota_interna :'',
    nota_cliente :'',
    orden_de_compra:'',


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
                console.log('Campos limpiados por cambio a retiro');
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


    

    return {
        form,
        clearForm
    };


}