import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { CLIENT_API_ROUTES } from "@/constants/apiRoutes/ventas/cliente/clientRoutes";
import { ref } from "vue";
import { useStore } from 'vuex'

export function useDireccionProcess() {
    const store = useStore();
    const ptoVtaSelect = store.state.puntodeventaselect;
    const { run } = useApiAction();
    const loading = ref(false);


    const getInitialForm = () => ({
        cliente_id: null,
        direccion: null,
        contacto: null,
        referencia: null,
        region_id: null,
        provincia_id: null,
        canton_id: null,
        telefono: null,
        email: null,
        puntoVenta: ptoVtaSelect // Asumiendo que ptoVtaSelect está disponible en este scope
    });

    const form = ref(getInitialForm());

    async function createNewAddress() {
        return run(() => axiosClient.post(CLIENT_API_ROUTES.BRANCHES.CREATE, { form: form.value }), {
            loadingRef: loading,
            onSuccess: () => {
                resetModalForm();
            },
            successMessage: 'Proceso realizado exitosamente',
        });
    }

    function resetModalForm() {
        form.value = getInitialForm();
    }

    return {
        loading,
        form,
        createNewAddress,
        //apis selects 
        resetModalForm
    };


}
