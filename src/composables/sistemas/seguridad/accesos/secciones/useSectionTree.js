import axiosClient from "@/axios";
import { ref, reactive, computed } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";


export function useSectionTree() {
    const { run } = useApiAction();
    const selectedSection = ref(null);
    const payload = reactive({
        platform: 'web',
        onlyActive: true,
    });
    const loading = ref(false);
    const sections = ref([]);
    const apiSections = 'secciones/lista-secciones';

    async function fetchSections() {
        return run(() => axiosClient.get(apiSections, {
            params: {
                platform: payload.platform,
                only_active: payload.onlyActive ? 1 : 0,
            },
        }), {
            loadingRef: loading,
            onSuccess: (info) => {
                sections.value = info ?? [];
            }
        });
    }

    const loadingOptions = ref(false);
    const parentOptions = ref([]);
    const apiParentOptions = 'secciones/options';

    async function fetchParentOptions(excludeId = null) {
        return run(() => axiosClient.get(apiParentOptions, {
            params: {
                platform: payload.platform,
                exclude_id: excludeId
            },
        }), {
            loadingRef: loadingOptions,
            onSuccess: (info) => {
                parentOptions.value = info ?? [];
            }

        })
    }


    const hasSections = computed(() => sections.value.length > 0);

    async function refresh() {
        await fetchSections();
    }


    function selectSection(section) {
        selectedSection.value = { ...section };
    }
    function clearSelection() {
        selectedSection.value = null;
    }
    function changeOnlyActive(value) {
        payload.onlyActive = Boolean(value)
    }
    function changePlatform(newPlatform) {
        payload.platform = newPlatform;
    }




    return {
        payload,
        loading,
        loadingOptions,
        sections,
        fetchSections,
        parentOptions,
        fetchParentOptions, 
        hasSections,
        refresh,
        changeOnlyActive,
        changePlatform,
        selectSection,
        clearSelection,
        selectedSection,
    }


}