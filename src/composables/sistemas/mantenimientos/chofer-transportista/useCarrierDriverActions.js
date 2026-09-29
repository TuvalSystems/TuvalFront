import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { PROVIDER_API_ROUTES } from "@/constants/apiRoutes/ventas/proveedores/providerRoutes";
import useVuelidate from "@vuelidate/core";
import { helpers, required } from "@vuelidate/validators";
import { computed, reactive, ref, unref, watch } from "vue";

const requiredField = (message) => helpers.withMessage(message, required);

function initialForm() {
    return {
        id: null,
        proveedor_id: null,
        tipo_identificacion_id: null,
        identificacion: "",
        nombre: "",
        placa: "",
    };
}

export function useCarrierDriverActions(listTypeIdentify) {
    const { run } = useApiAction();
    const form = reactive(initialForm());

    const selectedTypeIdentify = computed(() => {
        const types = unref(listTypeIdentify) ?? [];

        return (
            types.find(
                (type) => Number(type.id) === form.tipo_identificacion_id
            ) ?? null
        );
    });

    const identifyMinSize = computed(() =>
        Number(selectedTypeIdentify.value?.min_size ?? 0)
    );
    const identifyMaxSize = computed(() =>
        Number(selectedTypeIdentify.value?.max_size ?? 0)
    );
    const identifyName = computed(
        () => selectedTypeIdentify.value?.nombre ?? "Identificación"
    );
    const identifyMaxAllowed = computed(() => identifyMaxSize.value || 30);

    const identifyLengthMessage = computed(() => {
        const min = identifyMinSize.value;
        const max = identifyMaxSize.value;

        if (min && max && min === max) {
            return `${identifyName.value} debe tener ${max} caracteres`;
        }
        if (min && max) {
            return `${identifyName.value} debe tener entre ${min} y ${max} caracteres`;
        }
        if (max) {
            return `${identifyName.value} debe tener máximo ${max} caracteres`;
        }
        return `${identifyName.value} no tiene una longitud válida`;
    });

    const numericIdentificationCodes = ["04", "05"];
    const identifyOnlyNumbers = computed(() =>
        numericIdentificationCodes.includes(
            String(selectedTypeIdentify.value?.codigo ?? "")
        )
    );
    const identifyInputMode = computed(() =>
        identifyOnlyNumbers.value ? "numeric" : "text"
    );
    const identifyFormatMessage = computed(() =>
        identifyOnlyNumbers.value
            ? `${identifyName.value} solo debe contener números`
            : `${identifyName.value} solo debe contener letras y números`
    );

    const validIdentifyLength = helpers.withMessage(
        () => identifyLengthMessage.value,
        (value) => {
            const text = String(value ?? "").trim();
            if (!text) return true;

            const min = identifyMinSize.value;
            const max = identifyMaxSize.value;
            if (min && text.length < min) return false;
            if (max && text.length > max) return false;
            return true;
        }
    );

    const validIdentifyFormat = helpers.withMessage(
        () => identifyFormatMessage.value,
        (value) => {
            const text = String(value ?? "").trim();
            if (!text) return true;

            return identifyOnlyNumbers.value
                ? /^\d+$/.test(text)
                : /^[A-Za-z0-9]+$/.test(text);
        }
    );

    const rules = computed(() => ({
        proveedor_id: {
            required: requiredField("Seleccione un proveedor"),
        },
        tipo_identificacion_id: {
            required: requiredField("Seleccione el tipo de identificación"),
        },
        identificacion: {
            required: requiredField("Ingrese la identificación"),
            validIdentifyFormat,
            validIdentifyLength,
        },
        nombre: {
            required: requiredField("Ingrese el nombre")
        },
        placa: {
            required: requiredField("Ingrese la placa")
        }
    }));

    const v$ = useVuelidate(rules, form);

    function onIdentificationInput(event) {
        let value = String(event.target.value ?? "");

        if (identifyOnlyNumbers.value) {
            value = value.replace(/\D/g, "");
        } else {
            value = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
        }

        form.identificacion = value;
        event.target.value = value;
    }

    watch(
        () => form.tipo_identificacion_id,
        () => {
            form.identificacion = "";
            v$.value.identificacion.$reset();
        }
    );

    const loadingSaved = ref(false);
    async function savedCarrierDriver(payload) {
        return run(
            () =>
                axiosClient.post(
                    PROVIDER_API_ROUTES.CARRIER_DRIVER.CREATE_REGISTER,
                    { payload }
                ),
            {
                loadingRef: loadingSaved,
                onError: (backend, error) => {
                    console.error(backend, error);
                },
            }
        );
    }

    return {
        form,
        v$,
        //validacion para tipo de identificacion
        selectedTypeIdentify,
        identifyName,
        identifyMaxAllowed,
        identifyLengthMessage,
        identifyInputMode,
        onIdentificationInput,
        loadingSaved,
        savedCarrierDriver,
    };
}
