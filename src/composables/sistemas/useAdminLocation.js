import axiosClient from "@/axios";
import { useApiAction } from "../core/useApiAction";
import { ref } from "vue";
import { ADMIN_API_ROUTES } from "@/constants/apiRoutes/sistema/useAdminRoutes";


export function useAdminLocation() {
    const { run } = useApiAction();

    const loadingRegions = ref(false);
    const regions = ref([]);
    async function fetchRegions() {
        return await run(async () => axiosClient.get(ADMIN_API_ROUTES.LOCATION.REGIONS), {
            loadingRef: loadingRegions,
            onSuccess: (info) => {
                regions.value = Array.isArray(info) ? info : [];
            },
            onError: (backend, error) => {
                console.log(backend, error);
            }
        });
    }


    const loadingProvinces = ref(false);
    const provinces = ref([]);
    async function fetchProvinces(id) {
        return await run(async () => axiosClient.post(ADMIN_API_ROUTES.LOCATION.PROVINCES, { id: id }), {
            loadingRef: loadingProvinces,
            onSuccess: (info) => {
                provinces.value = Array.isArray(info) ? info : [];
            },
            onError: (backend, error) => {
                console.log(backend, error);
            }
        });
    }

    const loadingCantons = ref(false);
    const cantons = ref([]);
    async function fetchCantons(id) {
        return await run(async () => axiosClient.post(ADMIN_API_ROUTES.LOCATION.CANTONS, { id: id }),
            {
                loadingRef: loadingCantons,
                onSuccess: (info) => {
                    cantons.value = Array.isArray(info) ? info : [];
                },
                onError: (backend, error) => {
                    console.log(backend, error);

                }
            });
    }

    const loadingParishes = ref(false);
    const parishes = ref([]);
    async function fetchParishes(id) {
        return await run(async () => axiosClient.post(ADMIN_API_ROUTES.LOCATION.PARISHES, { id: id }), {
            loadingRef: loadingParishes,
            onSuccess: (info) => {
                parishes.value = Array.isArray(info) ? info : [];
            },
            onError: (backend, error) => {
                console.log(backend, error);

            }
        });
    }


    return {
        //regiones
        loadingRegions,
        fetchRegions,
        regions,
        //provincias
        loadingProvinces,
        provinces,
        fetchProvinces,
        //cantones
        fetchCantons,
        loadingCantons,
        cantons,

        //parroquias
        loadingParishes,
        parishes,
        fetchParishes

    }
}