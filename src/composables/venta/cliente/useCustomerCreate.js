import useVuelidate from "@vuelidate/core";
import { unref, reactive, computed, ref } from "vue";
import { required, maxLength, email, helpers } from "@vuelidate/validators";
import { swalError } from "@/functions/swal-alert";
import { useApiAction } from "@/composables/core/useApiAction";
import axiosClient from "@/axios";
import { CLIENT_API_ROUTES } from "@/constants/apiRoutes/ventas/cliente/clientRoutes";

const requiredField = (message) => helpers.withMessage(message, required);
const maxLengthField = (limit) =>
    helpers.withMessage(`Máximo ${limit} caracteres`, maxLength(limit));

const MAX_ADDRESSES = 2;

function initialAddress() {
    return {
        // La región solo se usa para cargar las provincias disponibles.
        region_id: null,
        provincia_id: null,
        canton_id: null,
        direccion: "",
        provinces: [],
        cantons: [],
    };
}

function initialForm() {
    return {
        //identificacion
        tipo_identificacion_id: null,
        identificacion: "",
        razon_social: "",
        nombre_corto: "",
        contacto: "",
        //ubicacion
        direcciones: [initialAddress()],
        //conacto
        telefono1: "",
        telefono2: "",
        telefono3: "",
        telefono4: "",
        correo_sri: "",
        correo_contacto: "",

        //clasificacion
        grupo_id: null,
        // subgrupo_id: null,
        segmento_id: null,
        subsegmento_id: null,
        codigo_vendedor: 9

    };
}

export function useCustomerCreate(listTypeIdentify) {
    const { run } = useApiAction();
    const form = reactive(initialForm());


    /**validacion para ruc  */
    const selectedTypeIdentify = computed(() => {
        const types = unref(listTypeIdentify) ?? [];

        return (
            types.find(
                (type) =>
                    Number(type.id) === Number(form.tipo_identificacion_id)
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



    /** validacion de email */
    const noEmailSpaces = helpers.withMessage(
        "El correo no debe contener espacios en blanco. Revise que no tenga espacios antes, dentro o después del correo.",
        (value) => {
            const text = String(value ?? "");

            if (!text) {
                return true;
            }

            return !/\s/.test(text);
        }
    );
    const validEmailMessage = helpers.withMessage(
        "Ingrese un correo electrónico válido. Ejemplo: usuario@dominio.com",
        email
    );



    const rules = computed(() => ({
        tipo_identificacion_id: {
            required: requiredField("Seleccione el tipo de identificación"),
        },
        identificacion: {
            required: requiredField("Ingrese la identificación"),
            validIdentifyFormat,
            validIdentifyLength,
        },
        razon_social: {
            required: requiredField("Ingrese la razón social"),
            maxLength: maxLengthField(65),
        },
        nombre_corto: {
            required: requiredField("Ingrese el campo"),
            maxLength: maxLengthField(15)
        },
        contacto: {
            required: requiredField("Ingrese el contacto"),
            maxLength: maxLengthField(30)

        },
        direcciones: {
            required: requiredField("Ingrese al menos una dirección"),
            maxLength: helpers.withMessage(
                `Puede ingresar máximo ${MAX_ADDRESSES} direcciones`,
                maxLength(MAX_ADDRESSES)
            ),
            $each: helpers.forEach({
                region_id: {
                    required: requiredField("Seleccione la región")
                },
                provincia_id: {
                    required: requiredField("Seleccione la provincia")
                },
                canton_id: {
                    required: requiredField("Seleccione la ciudad")
                },
                direccion: {
                    required: requiredField("Ingrese una dirección"),
                    maxLength: maxLengthField(122)
                },
            })
        },
        telefono1: {
            required: requiredField("Ingrese el teléfono"),
            maxLength: maxLengthField(21),
        },
        telefono2: {
            maxLength: maxLengthField(21),
        },
        telefono3: {
            maxLength: maxLengthField(21),
        },
        telefono4: {
            maxLength: maxLengthField(21),
        },
        correo_sri: {
            required: requiredField("Ingrese el correo electrónico Sri."),
            noEmailSpaces,
            email: validEmailMessage,
            maxLength: maxLengthField(200)
        },
        correo_contacto: {
            noEmailSpaces,
            email: validEmailMessage,
            maxLength: maxLengthField(200)
        },
        segmento_id: {
            required: requiredField("Seleccione un segmento")
        },
        subsegmento_id: {
            required: requiredField("Seleccione un subsegmento")
        },

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

    function onIdentificationTypeChange() {
        form.identificacion = "";
        v$.value.identificacion.$reset();
    }

    function resetForm() {
        Object.assign(form, initialForm());
        v$.value.$reset();
    }


    const identifyCurrentLength = computed(() => {
        return String(form.identificacion ?? "").length;
    });
    const identifyRemainingCharacters = computed(() => {
        return Math.max(identifyMaxAllowed.value - identifyCurrentLength.value, 0);
    });

    const identifyCounterClass = computed(() => {
        if (identifyRemainingCharacters.value === 0) {
            return "bg-danger text-white";
        }

        if (identifyRemainingCharacters.value <= 3) {
            return "bg-warning text-dark";
        }

        return "bg-body-secondary text-muted";
    });



    /** validacion de nombre corto  */
    const shortNameMaxAllowed = computed(() => 15);
    const shortNameCurrentLength = computed(() => {
        return String(form.nombre_corto ?? "").length;
    })
    const shortNameRemainingCharacters = computed(() => {
        return Math.max(shortNameMaxAllowed.value - shortNameCurrentLength.value, 0);
    });

    const shortNameCounterClass = computed(() => {
        if (shortNameRemainingCharacters.value === 0) {
            return "bg-danger text-white";
        }

        if (shortNameRemainingCharacters.value <= 3) {
            return "bg-warning text-dark";
        }

        return "bg-body-secondary text-muted";
    });


    const sanitizeAddressText = (event, index) => {
        const sanitize = event.target.value.replace(
            /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s_-]/g,
            ""
        );
        event.target.value = sanitize;
        form.direcciones[index].direccion = sanitize;
    }

    function addAddress() {
        if (form.direcciones.length >= MAX_ADDRESSES) return false;

        form.direcciones.push(initialAddress());
        return true;
    }

    function removeAddress(index) {
        if (form.direcciones.length <= 1) return false;

        form.direcciones.splice(index, 1);
        return true;
    }



    /** validacion de existencia de ruc */
    const loadingValidateIdentification = ref(false);
    async function validateIdentification(identification) {
        return run(() => axiosClient.post(CLIENT_API_ROUTES.ACTIONS.VALIDATE_IDENTIFICATION, { documento: identification }), {
            loadingRef: loadingValidateIdentification,
            onError: (backend, error) => {
               console.log(backend, error);
            }
        });
    }

    const loadingValidateProspectIdentification = ref(false);
    async function validateProspectIdentification(identification, { showError = true } = {}) {
        return run(() => axiosClient.post(CLIENT_API_ROUTES.ACTIONS.VALIDATE_PROSPECT_IDENTIFICATION, { documento: identification }), {
            loadingRef: loadingValidateProspectIdentification,
            onError: (backend, error) => {
                if (!showError) return;
                swalError(
                    backend?.error ||
                    backend?.message ||
                    error?.message ||
                    "Error al validar la identificación"
                );
            }
        });
    }
    const loadingGroups = ref(false);
    const groups = ref([]);
    async function fetchGroups() {
        return await run(async () => axiosClient.get(CLIENT_API_ROUTES.ACTIONS.LIST_GROUPS), {
            loadingRef: loadingGroups,
            onSuccess: (info) => {
                groups.value = Array.isArray(info) ? info : [];
            },
            onError: (backend, error) => {
                console.log(backend, error);
            }
        });
    }

    const loadingSaveCustomer = ref(false);
    async function saveCustomer() {
        if (loadingSaveCustomer.value) {
            return {
                ok: false,
                busy: true,
                message: "El cliente ya se está procesando.",
                status: 409,
            };
        }

        const valid = await v$.value.$validate();
        if (!valid) {
            return {
                ok: false,
                validation: true,
                message: "Revise los campos obligatorios o inválidos.",
                status: 409,

            };
        }

        const { direcciones, ...customerData } = form;
        const payload = {
            ...customerData,
            direcciones: direcciones.map((address) => ({
                direccion: address.direccion.trim(),
                provincia_id: address.provincia_id,
                canton_id: address.canton_id,
                region_id: address.region_id,
            })),
        };
        return run(() => axiosClient.post(CLIENT_API_ROUTES.ACTIONS.CREATE_CUSTOMER, { payload: payload }), {
            loadingRef: loadingSaveCustomer,
            onError: (backend, error) => {
                swalError(
                    backend?.error ||
                    backend?.message ||
                    error?.message ||
                    "Error al crear el cliente"
                );
            }
        });
    }



    return {
        form,
        resetForm,
        v$,

        //validacion ruc 
        identifyName,
        selectedTypeIdentify,
        identifyMaxAllowed,
        identifyLengthMessage,
        identifyInputMode,
        onIdentificationInput,
        onIdentificationTypeChange,
        identifyCurrentLength,
        identifyCounterClass,

        //nombre corto
        shortNameMaxAllowed,
        shortNameCurrentLength,
        shortNameRemainingCharacters,
        shortNameCounterClass,

        //direcciones
        MAX_ADDRESSES,
        addAddress,
        removeAddress,
        sanitizeAddressText,

        //validacion de existencia de ruc
        loadingValidateIdentification,
        validateIdentification,
        //validacion de existencia de ruc prospecto
        loadingValidateProspectIdentification,
        validateProspectIdentification,
        //lista de grupos 
        loadingGroups,
        fetchGroups,
        groups,

        //creacion de cliente
        loadingSaveCustomer,
        saveCustomer,

    }
}
