import axiosClient from "@/axios";
import { ref, reactive } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import { SYSTEM_USERS_API_ROUTES } from "@/constants/apiRoutes/sistema/userRoutes";


function hasMobileAppAccess(row) {
    return Number(
        row?.app_access ?? 0
    ) === 1;
}

function hasAdminCollectionAccess(row) {
    return Number(row?.is_admin_cobros ?? 0) === 1;
}

export function useUserActions() {
    const {
        run
    } = useApiAction();
    const loadingStatus = ref(false);

    async function UpdateStatus(id) {
        return run(() => axiosClient.post(SYSTEM_USERS_API_ROUTES.ACTIONS.CHANGE_STATUS, {
            id: id
        }), {
            loadingRef: loadingStatus,
        });
    }

    const loadingReset = ref(false);
    async function resetPasswordUser(id) {
        return run(() => axiosClient.post(SYSTEM_USERS_API_ROUTES.ACTIONS.RESET_PASSWORD, {
            id: id
        }), {
            loadingRef: loadingReset,
        })
    }



    const loadingDetail = ref(false);
    const detailUser = ref(null);
    async function getDetailUser(id) {
        return run(() => axiosClient.post(SYSTEM_USERS_API_ROUTES.ACTIONS.DETAIL, {
            id: id
        }), {
            loadingRef: loadingDetail,
            onSuccess: (info) => {
                detailUser.value = info ?? null
            }
        });
    }


    const loadingProfileWeb = ref(false);
    const perfilesWeb = ref([]);
    async function getProfilesWeb() {
        return run(() => axiosClient.post(SYSTEM_USERS_API_ROUTES.PROFILE.WEB), {
            loadingRef: loadingProfileWeb,
            onSuccess: (info) => {
                perfilesWeb.value = info ?? []
            }
        })
    }


    const loadingProfileApp = ref(false);
    const perfilesApp = ref([]);
    async function getProfilesApp() {
        return run(() => axiosClient.post(SYSTEM_USERS_API_ROUTES.PROFILE.APP), {
            loadingRef: loadingProfileApp,
            onSuccess: (info) => {
                perfilesApp.value = info ?? []
            }
        })
    }




    const loadingMobileAppAccess = ref(false);
    async function updateMobileAppAccess(id) {
        return run(() => axiosClient.post(SYSTEM_USERS_API_ROUTES.ACCESS.MOBILE_APP, { id: id }), {
            loadingRef: loadingMobileAppAccess
        });
    }


    const loadingAdminCollectionAccess = ref(false);
    async function updateAdminCollectionAccess(id) {
        return run(() => axiosClient.post(SYSTEM_USERS_API_ROUTES.ACCESS.COLLECTION_ADMIN, { id: id }), {
            loadingRef: loadingAdminCollectionAccess
        });
    }



    /** proceso de guardado de gestion de usuarios  */
    const form = reactive({
        user_id: null,
        perfil_id: null,
        perfil_app_id: null,
    });
    const loadingUpdateProfiles = ref(false);
    async function updateProfilesUser() {
        return run(() => axiosClient.post(SYSTEM_USERS_API_ROUTES.PROFILE.UPDATE, { form }), {
            loadingRef: loadingUpdateProfiles,
        });
    }



    const loadingSectionsActive = ref(false);
    const listSectionsActives = ref([]);
    const homeSectionActive = ref(null);
    async function fetchSectionsActivesByUser() {
        return run(() => axiosClient.post(SYSTEM_USERS_API_ROUTES.SECTIONS.ACTIVE), {
            loadingRef: loadingSectionsActive,
            onSuccess: (info) => {
                listSectionsActives.value = Array.isArray(info?.menu) ? info.menu : [];
                homeSectionActive.value = info?.home ?? null;
            }
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
        updateAdminCollectionAccess,
        //proceso de actualizacion de detalle de usuario 
        form,
        loadingUpdateProfiles,
        updateProfilesUser,

        //secciones activas del usuario autenticado
        loadingSectionsActive,
        listSectionsActives,
        homeSectionActive,
        fetchSectionsActivesByUser

    }
}
