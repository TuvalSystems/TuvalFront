import axiosClient from "@/axios";
import { ref, reactive } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";

export function useProfileList() {
    const { run } = useApiAction();
    const payload = reactive({
        platform: 'web',
        status: 'active',
        search: '',
    });
    const profiles = ref([]);
    const loading = ref(false);
    const apiProfiles = 'perfiles/lista';

    async function fetchProfiles() {
        return run(() => axiosClient.get(apiProfiles, {
            params: {
                platform: payload.platform,
                status: payload.status,
                search: payload.search,
            }
        }), {
            loadingRef: loading,
            onSuccess: (info) => {
                profiles.value = info ?? [];
            }
        });
    }

    async function refresh() {
        await fetchProfiles();
    }

    return {
        payload,
        profiles,
        loading,
        fetchProfiles,
        refresh,
    }
}