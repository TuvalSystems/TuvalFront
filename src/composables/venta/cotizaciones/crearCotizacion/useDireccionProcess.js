import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ref, reactive, watch, computed } from "vue";
import { swalError } from "@/functions/swal-alert";
import { useStore } from 'vuex'

export function useDireccionProcess() {
    const store = useStore();
    const ptoVtaSelect = store.state.puntodeventaselect;
    const { run } = useApiAction();
    const loading = ref(false);
    const apiCreateAddress = '/cotizaciones/guardar-nueva-direccion-sucursal';

    const getInitialForm = () => ({
        cliente_id: null,
        direccion: null,
        contacto: null,
        referencia: null,
        territorio: null,
        provincia: null,
        ciudad: null,
        telefono: null,
        email: null,
        puntoVenta: ptoVtaSelect // Asumiendo que ptoVtaSelect está disponible en este scope
    });

    const form = ref(getInitialForm());

    const loadingTerritories = ref(false);
    const allTerritories = ref([]);
    const Apiterritories = 'consultas/new-territorios';
    async function fetchAllTerritories() {
        return run(() => axiosClient.post(Apiterritories), {
            loadingRef: loadingTerritories,
            onSuccess: (res) => {
                allTerritories.value = res;
            },
            successMessage: 'Proceso realizado exitosamente',
        })
    }

    const loadingProvincies = ref(false);
    const allProvincies = ref([]);
    const ApiProvincies = 'consultas/provincias';
    async function fetchAllProvincies() {
        return run(() => axiosClient.post(ApiProvincies), {
            loadingRef: loadingProvincies,
            onSuccess: (res) => {
                allProvincies.value = res;
            },
            successMessage: 'Proceso realizado exitosamente',
        })
    }

    const allCities = ref([]);
    const ApiCities = 'consultas/ciudades';
    const loadingCities = ref(false);
    async function fetchAllCities() {
        if (!form.value.provincia) return
        return run(() => axiosClient.post(ApiCities, { provincia: form.value.provincia }), {
            loadingRef: loadingCities,
            onSuccess: (res) => {
                allCities.value = res;
            },
            successMessage: 'Proceso realizado exitosamente',
        })
    }


    async function createNewAddress() {
        return run(() => axiosClient.post(apiCreateAddress, { form: form.value }), {
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
        loadingTerritories,
        fetchAllTerritories,
        allTerritories,

        loadingProvincies,
        fetchAllProvincies,
        allProvincies,

        loadingCities,
        fetchAllCities,
        allCities,
        resetModalForm
    };


}