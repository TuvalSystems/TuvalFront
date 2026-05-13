import axiosClient from "@/axios";
import {
    ref
} from "vue";
import {
    useApiAction
} from "@/composables/core/useApiAction";


 function hasMobileAppAccess(row){
        return Number(
            row?.app_access ?? 0
        ) === 1;
    }

     function hasAdminCollectionAccess(row){
        return Number( row?.is_admin_cobros ?? 0  ) === 1;
    }

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
    const apiDetailUser = 'usuario/detalle-usuario';
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
    const apiProfileWeb = 'usuario/perfiles-web'
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
    const apiProfileApp = 'usuario/perfiles-app'
    const perfilesApp = ref([]);
    async function getProfilesApp() {
        return run(() => axiosClient.post(apiProfileApp), {
            loadingRef: loadingProfileApp,
            onSuccess: (info) => {
                perfilesApp.value = info ?? []
            }
        })
    }


    

    const loadingMobileAppAccess = ref(false);
    const apiMobileAppAccess = 'usuario/acceso-app-movil';
    async function updateMobileAppAccess(id){
        return run(() => axiosClient.post(apiMobileAppAccess, { id : id}), {
            loadingRef : loadingMobileAppAccess
        });
    }


    const loadingAdminCollectionAccess = ref(false);
    const apiAdminCollectionAccess = 'usuario/acceso-admin-cobros';
    async function updateAdminCollectionAccess(id){
        return run(() => axiosClient.post(apiAdminCollectionAccess, { id : id}), {
            loadingRef : loadingAdminCollectionAccess
        });
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

        //funciones helpers 
        hasMobileAppAccess,
        hasAdminCollectionAccess,
        //access app movil
        loadingMobileAppAccess,
        updateMobileAppAccess,

        //acceso admin cobros
        loadingAdminCollectionAccess,
        updateAdminCollectionAccess

    }
}