import axiosClient from "@/axios";
import {
    ref
} from "vue";
import {
    useApiAction
} from "@/composables/core/useApiAction";


export function useUserActions() {
    const {
        run
    } = useApiAction();
    const loadingStatus = ref(false);
    const apiUpdateStatus = 'usuario/change-status-user';

    async function UpdateStatus(id) {
        return run(() => axiosClient.post(apiUpdateStatus, {
            id: id
        }), {
            loadingRef: loadingStatus,
        });
    }

    const loadingReset = ref(false);
    const apiUpdateReset = 'usuario/reset-password';
    async function resetPasswordUser(id) {
        return run(() => axiosClient.post(apiUpdateReset, {
            id: id
        }), {
            loadingRef: loadingReset,
        })
    }



    const loadingDetail = ref(false);
    const apiDetailUser = 'usuarios/detalle-usuario';
    const detailUser = ref([]);
    async function getDetailUser(id) {
        return run(() => axiosClient.post(apiDetailUser, {
            id: id
        }), {
            loadingRef: loadingDetail,
            onSuccess: (info) => {
                dataDetail.value = info ?? []
            }
        });
    }


    const loadingProfileWeb = ref(false);
    const apiProfileWeb = 'usuarios/perfiles-web'
    const perfilesWeb = ref([]);
    async function getProfilesWeb() {
        return run(() => axiosClient.post(apiProfileWeb), {
            loadingRef: loadingProfileWeb,
            onSuccess: (info) => {
                perfilesWeb.value = info ?? []
            }
        })
    }


    const loadingProfileApp = ref(false);
    const apiProfileApp = 'usuarios/perfiles-app'
    const perfilesApp = ref([]);
    async function getProfilesApp() {
        return run(() => axiosClient.post(apiProfileApp), {
            loadingRef: loadingProfileApp,
            onSuccess: (info) => {
                perfilesApp.value = info ?? []
            }
        })
    }



    return {
        loadingStatus,
        UpdateStatus,
        loadingReset,
        resetPasswordUser,

        //detalle de usuario 
        loadingDetail,
        detailUser,
        getDetailUser,

        //lista de perfiles web 
        loadingProfileWeb,
        getProfilesWeb,
        perfilesWeb,
        //lista de perfiles app
        loadingProfileApp,
        getProfilesApp,
        perfilesApp,
    }
}