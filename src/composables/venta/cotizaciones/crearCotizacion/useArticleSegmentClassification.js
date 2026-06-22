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
    function getUniqueOptions(rows, field) {
        const values = new Set();
        rows.forEach(row => {
            const value = normalizeValues(row[field]);
            if (value) {
                values.add(value);
            }
        });
        return Array.from(values)
            .sort((a, b) => a.localeCompare(b))
            .map(value => ({
                value, label: value
            }));
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
        return getUniqueOptions(classificationConfigList.value, "codigoCategoria");
    });
    const lineList = computed(() => {
        const rows = classificationConfigList.value.filter(row => {
            return !segmentFilters.codigoCategoria || normalizeValues(row.codigoCategoria) === segmentFilters.codigoCategoria
        });
        return getUniqueOptions(rows, "codigoLinea");
    });

    const classList = computed(() => {
        const rows = classificationConfigList.value.filter(row => {
            return (!segmentFilters.codigoCategoria || normalizeValues(row.codigoCategoria) === segmentFilters.codigoCategoria)
                && (!segmentFilters.codigoLinea || normalizeValues(row.codigoLinea) === segmentFilters.codigoLinea);
        });
        return getUniqueOptions(rows, "codigoClase");
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




    const hasActiveSegmentFilter = computed(() => {
        return Boolean(
            segmentFilters.codigoCategoria ||
            segmentFilters.codigoLinea ||
            segmentFilters.codigoClase
        );
    });

    const hasCompleteSegmentFilter = computed(() => {
        return Boolean(
            segmentFilters.codigoCategoria &&
            segmentFilters.codigoLinea &&
            segmentFilters.codigoClase
        );
    });


    //funciones para la visualizacion de acuerdo al filtro seleccionado 
    function isSameValue(val1, val2) {
        return normalizeValues(val1).toUpperCase() === normalizeValues(val2).toUpperCase();
    }

    function getArticleCategory(row) {
        return normalizeValues(row.cod_categoria);
    }
    function getArticleLine(row) {
        return normalizeValues(row.cod_linea);
    }
    function getArticleClass(row) {
        return normalizeValues(row.cod_clase);
    }

    function articleMatchesSelectedFilters(row) {
        if (!hasCompleteSegmentFilter.value) {
            return false;
        }

        return isSameValue(getArticleCategory(row), segmentFilters.codigoCategoria)
            && isSameValue(getArticleLine(row), segmentFilters.codigoLinea)
            && isSameValue(getArticleClass(row), segmentFilters.codigoClase);
    }

    function getArticleSegmentConfig(row) {
        if (!articleMatchesSelectedFilters(row)) {
            return null;
        }
        const articleCategory = getArticleCategory(row);
        const articleLine = getArticleLine(row);
        const articleClass = getArticleClass(row);

        if (!articleCategory || !articleLine || !articleClass) {
            return null;
        }

        const baseMatches = classificationConfigList.value.filter(conf => {
            return isSameValue(conf.codigoCategoria, articleCategory)
                && isSameValue(conf.codigoLinea, articleLine)
                && isSameValue(conf.codigoClase, articleClass);
        });
        if (baseMatches.length === 0) {
            return null;
        }

        return baseMatches
            .slice()
            .sort((a, b) => Number(b.codigoNivel || 0) - Number(a.codigoNivel || 0))[0];
    }

    function getArticleSegmentLevel(row) {
        const config = getArticleSegmentConfig(row);
        const level = Number(config?.codigoNivel || 0);
        return Math.min(Math.max(level, 0), 5);
    }

    function getArticleSegmentLabel(row) {
        const config = getArticleSegmentConfig(row);
        if (!config) {
            return "";
        }

        return `${config.descripcionNivel || ""} - Nivel ${config.codigoNivel}/5`;
    }

    //sort order de nivel 
    const levelSortDirection = ref(null);
    const articlesWithSegmentLevel = computed(() => {
        const rows = unref(articles) || [];

        if (!levelSortDirection.value) {
            return rows;
        }

        return rows.slice().sort((a, b) => {
            const levelA = getArticleSegmentLevel(a);
            const levelB = getArticleSegmentLevel(b);

            if (levelSortDirection.value === 'asc') {
                return levelA - levelB;
            }

            return levelB - levelA;
        });
    });


    function toggleLevelSort() {
        levelSortDirection.value = levelSortDirection.value === 'desc' ? 'asc' : 'desc';
    }

    function clearLevelSort() {
        levelSortDirection.value = null;
    }


    const loadingConfigLevel = ref(false);
    const configLevel = ref([]);
    async function fetchSegmentConfigLevel() {
        return run(() => axiosClient.get(INVENTARIO_ARTICULOS_API_ROUTES.CONFIGURACION_NIVEL_SEGMENTACION), {
            loadingRef: loadingConfigLevel,
            onSuccess: (info) => {
                configLevel.value = Array.isArray(info) ? info : [];
            }
        });
    }


    function hexToRgba(hex, alpha = 0.12) {
        const cleanHex = String(hex || "").replace("#", "").trim();
        if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
            return null;
        }
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function getLevelColorConfig(level) {
        return configLevel.value.find(item => {
            return Number(item.nivel) === Number(level);
        }) || null;
    }
    function getArticleSegmentRowStyle(row) {
        if (row.debe_resaltar) {
            return {};
        }

        const segmentConfig = getArticleSegmentConfig(row);
        if (!segmentConfig) {
            return {};
        }

        const level = Number(segmentConfig.codigoNivel || 0);
        const levelColorConfig = getLevelColorConfig(level);

        if (!levelColorConfig?.color) {
            return {};
        }

        const backgroundColor = hexToRgba(levelColorConfig.color, 0.12);
        const hoverColor = hexToRgba(levelColorConfig, 0.18);

        if (!backgroundColor) {
            return {};
        }

        return {
            '--bs-table-bg': backgroundColor,
            '--bs-table-hover-bg': hoverColor,
            borderLeft: `4px solid ${levelColorConfig.color}`,
        };
    }






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
        hasActiveSegmentFilter,
        hasCompleteSegmentFilter,

        fetchSegmentClassificationConfig,

        //filtro para asignacion de estrellas 
        getArticleSegmentLevel,
        getArticleSegmentLabel,

        //ordenamiento 
        articlesWithSegmentLevel,
        toggleLevelSort,
        clearLevelSort,

        //configuracion de color 
        loadingConfigLevel,
        configLevel,
        fetchSegmentConfigLevel,
        getArticleSegmentRowStyle


    }
}