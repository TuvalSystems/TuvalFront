import axiosClient from "@/axios";
import { ref, computed } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";


export function useProfileAction() {

    const { run } = useApiAction();
    // const form = ref(defaultForm());
    const saving = ref(false);
    const deleting = ref(false);

    const apiCreateProfile = 'perfiles/crear';
    const apiUpdateProfile = 'perfiles/actualizar';
    const apiDeleteProfile = 'perfiles/eliminar';


    function buildPayload(payload) {
        return {
            id: payload.id ?? null,
            name: payload.name,
            platform: payload.platform,
            state: payload.state,
        };
    }


    async function saveProfile(payload) {
        return run(() => axiosClient.post(apiCreateProfile, buildPayload(payload)), {
            loadingRef: saving,
        });
    }


    async function updateProfile(payload) {
        return run(() => axiosClient.post(apiUpdateProfile, buildPayload(payload)), {
            loadingRef: saving,
        });
    }

    async function deleteProfile(id) {
          return run(() => axiosClient.post(apiDeleteProfile, {
            id: id,
        }), {
            loadingRef: deleting,
        });
    }

    function resetForm() {
        form.value = defaultForm();
    }

    function createProfile() {
        form.value = defaultForm();
    }

    return {
        saving,
        deleting,
        saveProfile,
        updateProfile,
        deleteProfile,
    }
}