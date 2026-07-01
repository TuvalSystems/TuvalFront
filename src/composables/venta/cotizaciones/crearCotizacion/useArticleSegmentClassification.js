import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ref, reactive, watch, computed, unref } from "vue";
import { INVENTARIO_ARTICULOS_API_ROUTES } from "@/constants/apiRoutes/inventario/articleRoutes";



export function useArticleSegmentClassification(articles = ref([])) {
    const { run } = useApiAction();
    const loadingConfig = ref(false);
    const classificationConfigList = ref([]);
    const segmentFilters = reactive({
        codigoSegmento: "",
        codigoCategoria: "",
        codigoLinea: "",
        codigoClase: ""
    });

    function clearSegmentFilters() {
        segmentFilters.codigoCategoria = "";
        segmentFilters.codigoLinea = "";
        segmentFilters.codigoClase = "";
    }
    //function helper para filtro 
    function normalizeValues(value) {
        return String(value ?? "").trim();
    }

    function normalizeNivel(value) {
        return Number(value || 0);
    }
    function getUniqueOptions(rows, field, nivelField) {
        const values = new Map();
        rows.forEach(row => {

            const value = normalizeValues(row[field]);
            const nivelValue = normalizeNivel(row[nivelField]);

            if (value) {
                const key = `${value}-${nivelValue}`;
                if (!values.has(key)) {
                    values.set(key, {
                        value: value,
                        label: value,
                        nivel: nivelValue
                    });
                }
            }
        });


        return Array.from(values.values())
            .sort((a, b) => a.label.localeCompare(b.label));
    }

    async function fetchSegmentClassificationConfig() {
        const params = {
            codigoSegmento: segmentFilters.codigoSegmento,
            codigoCategoria: segmentFilters.codigoCategoria,
            codigoLinea: segmentFilters.codigoLinea,
        };
        return run(() => axiosClient.post(INVENTARIO_ARTICULOS_API_ROUTES.CONFIGURACION_SEGMENTACION, params), {
            loadingRef: loadingConfig,
            onSuccess: (info) => {
                classificationConfigList.value = Array.isArray(info) ? info : [];
            },
            successMessage: 'Lista Obtenida Exitosamente',
        });
    }

    const categoryList = computed(() => {
        return getUniqueOptions(classificationConfigList.value, "codigoCategoria", 'nivelCategoria');
    });
    const lineList = computed(() => {
        if (!segmentFilters.codigoCategoria) {
            return [];
        }
        const rows = classificationConfigList.value.filter(row => {
            return normalizeValues(row.codigoCategoria) === segmentFilters.codigoCategoria
        });
        return getUniqueOptions(rows, "codigoLinea", "nivelLinea");
    });

    const classList = computed(() => {
         if (!segmentFilters.codigoCategoria && !segmentFilters.codigoLinea) {
                return [];
            }
        const rows = classificationConfigList.value.filter(row => {
           
            return (normalizeValues(row.codigoCategoria) === segmentFilters.codigoCategoria)
                && (normalizeValues(row.codigoLinea) === segmentFilters.codigoLinea);
        });
        return getUniqueOptions(rows, "codigoClase", "nivelClase");
    });


    watch(
        () => segmentFilters.codigoCategoria,
        () => {
            segmentFilters.codigoLinea = "";
            segmentFilters.codigoClase = "";
        }
    );

    watch(
        () => segmentFilters.codigoLinea,
        () => {
            segmentFilters.codigoClase = "";
        }
    );









    return {
        loadingConfig,
        classificationConfigList,
        segmentFilters,

        //listas 
        categoryList,
        lineList,
        classList,

        //limpieza
        clearSegmentFilters,

        fetchSegmentClassificationConfig,


    }
}