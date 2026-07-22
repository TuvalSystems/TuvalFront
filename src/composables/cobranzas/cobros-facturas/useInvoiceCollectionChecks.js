import { computed, reactive, ref, watch } from "vue";
import useVuelidate from "@vuelidate/core";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import {
    decimal,
    helpers,
    required
} from "@vuelidate/validators";
import { formatDateForInput } from "@/utils/cobros/validateDate";




const requiredField = (message) => helpers.withMessage(message, required);
const decimalField = helpers.withMessage("Ingrese un valor numerico valido.", decimal);

function resolveSource(source) {
    if (typeof source === "function") {
        return source();
    }

    return source?.value ?? source;
}

function normalizeCollectionItems(source) {
    const items = resolveSource(source);

    return Array.isArray(items)
        ? items
        : Object.values(items ?? {});
}


function createEmptyCheck() {
    return {
        banco_id: "",
        fechaEmision: formatDateForInput(new Date()),
        fechaVencimiento: "",
        cuenta: "",
        cheque: "",
        montoRecibido: 0,
        montoNoAplicado: 0,
        montoAplicado: 0,
        comentario: "",
        facturas: []
    }
}


function createCheckRule() {
    return computed(() => ({
        banco_id: {
            required: requiredField("Seleccione el banco."),
        },
        cheque: {
            required: requiredField("Ingrese el cheque."),
        },
        cuenta: {
            required: requiredField("Ingrese la cuenta."),
        },

        montoRecibido: {
            required: requiredField("Ingrese el monto del deposito."),
            decimal: decimalField
        },
        fechaVencimiento : {
            required : requiredField("Seleccione la fecha de vencimiento")
        }
    }));
}


export function useInvoiceCollectionChecks() {

    const dateLimitConfig = reactive({
        locale : Spanish, 
        minDate : new Date(),
        maxDate : null
    });

    const invoiceOptions = computed(() => normalizeCollectionItems(facturas));
    const checkPayload = reactive(createEmptyCheck());
    const $v = useVuelidate(createCheckRule, checkPayload);
    
    
    

    return {}
}