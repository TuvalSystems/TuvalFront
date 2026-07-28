import { computed, reactive, ref, watch } from "vue";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import useVuelidate from "@vuelidate/core";
import {
    decimal,
    helpers,
    required
} from "@vuelidate/validators";
import { swalError, swalWarning } from "@/functions/swal-alert";
import { formatPriceJm, roundTo, toNumber } from "@/functions";
import { formatDateForInput } from "@/utils/cobros/validateDate";




function createEmptyApplication()
{
    return {
        documento : null,
        tipo :null,
        montoRecibido: 0,
        

    };
}

const requiredField = (message) => helpers.withMessage(message, required);

function resolveSource(source){
    if(typeof source === "function"){
        return source();
    }

    return source?.value ?? source;
}

function normalizeCollectionItems(source){
     const items = resolveSource(source);
     return Array.isArray(items) ? items : Object.values(items ?? {});
}