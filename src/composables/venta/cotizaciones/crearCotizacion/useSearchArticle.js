import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { onScopeDispose, ref, reactive, computed, toRef } from "vue";
import { swalWarning } from "@/functions/swal-alert";
import { useStore } from 'vuex'
import { ARTICLES_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/articleRoutes";
export function useSearchArticle() {
    const { run, invalidate } = useApiAction();
    const invalidateArticleSearch = () => ["loadingArt"].forEach(invalidate);
    onScopeDispose(invalidateArticleSearch);
    const store = useStore();
    const gallery = reactive({
        visible: false,
        index: 0,
        photos: [],
    });

    const loadingArt = ref(false);
    const articles = ref([]);
    const getInitialPayload = () => ({
        select_codigo: 'empieza',
        text_codigo: '',
        codigo3l: '',
        select_nombre: 'contiene',
        text_nombre: '',
        puntodeventaselect: store.state.puntodeventaselect,
        nivel_precio: '',
    });
    const payload = reactive(getInitialPayload());

    const cols = reactive([
        {
            name: "COD. GP",
            field: "ART_CODIGO",
            sort: "",
        },
        {
            name: "COD. Zafiro",
            field: "ART_CODIGO_ZAFIRO",
            sort: "",
        },

        {
            name: "Descripción",
            field: "ART_DESCRIPCION",
            sort: "",
        },
        {
            name: "CTL",
            field: "ART_CODIGO_TRES_LETRAS",
            sort: "",
        },
        {
            name: "U.Med",
            field: "ART_PLAN_UMEDIDA",
            sort: "",
        },
        {
            name: "Trans.",
            field: "ART_TRANSITO",
            sort: "",
        },
        {
            name: "Bodega",
            field: "ART_STOCK",
            sort: "",
        },
        {
            name: "Exposición",
            field: "stockExposicion",
            sort: "",
        },
        {
            name: "P.Lista",
            field: "ART_VALOR",
            sort: "",
        },
        {
            name: "P.+IVA",
            field: "ART_VALOR",
            sort: "",
        },
        {
            name: "Peso",
            field: "ART_PESO",
            sort: "",
        },
    ])
    function onSort(event, i) {
        let toset;
        const sortEl = cols[i];

        if (!event.shiftKey) {
            cols.forEach((o) => {
                if (o.field !== sortEl.field) {
                    o.sort = "";
                }
            });
        }

        if (!sortEl.sort) {
            toset = "asc";
        }

        if (sortEl.sort === "desc") {
            toset = event.shiftKey ? "" : "asc";
        }

        if (sortEl.sort === "asc") {
            toset = "desc";
        }

        sortEl.sort = toset;
    }

    const sortBy = computed(() => {
        return cols.reduce((acc, o) => {
            if (o.sort) {
                o.sort === "asc" ? acc.push(o.field) : acc.push("-" + o.field);
            }
            return acc;
        }, []);
    });

    const searchOptions = [
        { value: 'empieza', label: 'EMPIEZA POR' },
        { value: 'termina', label: 'TERMINA EN' },
        { value: 'contiene', label: 'CONTIENE' }
    ];




    function showPhoto(imagenes) {
        gallery.index = 0;
        gallery.visible = true;
        gallery.photos = imagenes;
    }
    function handleHide() {
        gallery.visible = false;
    }

    function validateSearch() {
        if (payload.text_codigo === '' && payload.text_nombre === '' && payload.codigo3l === '') {
            swalWarning('Debe ingresar al menos un criterio de busqueda');
            return false;
        }
        return true;
    }

    function resetSearch() {
        invalidateArticleSearch();
        payload.text_codigo = '';
        payload.text_nombre = '';
        payload.codigo3l = '';
        articles.value = [];
    }




    //funcion para verificar si el articulo puede ser seleccionado
    const isSelectable = (row) => {
        return row.ART_VALOR > 0
    }

    const getFinalPrice = (row) => {
        const precioBase = parseFloat(Number(row.ART_VALOR)) || 0;
        const porcentajeIva = parseFloat(Number(row.ART_IMP_VTA)) || 0;
        const descuento = precioBase * 0.25;
        const impuesto = 1 + (porcentajeIva / 100);
        return (precioBase - descuento) * impuesto;
    }


    //function de consulta para listar todos los articulos de acuerdo a los filtros
    async function fetchSearchArticles() {
        return await run(() => axiosClient.post(ARTICLES_API_ROUTES.ITEMS, { ...payload }), {
            loadingRef: loadingArt,
            latestOnly: true,
            key: "loadingArt",
            onSuccess: (res) => {
                articles.value = res.filter((article) => {
                    const purchaseType = (article.ART_TIPO_COMPRA || '').trim().toUpperCase();
                    return purchaseType !== 'L';
                });
            },
            successMessage: 'Proceso realizado exitosamente',
        })
    }


    //funciones para stock transito 
    async function fetchStockTransit(row, form) {
        const loadingRowRef = toRef(row, 'loadingStockTransit');
        const payloadTransit = {
            articulo: row.ART_CODIGO, // O el campo que necesites
            sucursal_id: form.direccion_facturacion_id, // Asumiendo que tienes esto en tu form
            cliente_id: form.cliente.id,   // Asumiendo que tienes esto
            puntodeventa_id: store.state.puntodeventaselect // O de tu store
        };
        return run(() => axiosClient.post(ARTICLES_API_ROUTES.CONSULT.STOCK_TRANSIT, payloadTransit), {
            loadingRef: loadingRowRef,
            onSuccess: (res) => {
                row.stockTransito = res || null;
            },
            successMessage: 'Proceso realizado exitosamente',
        });
    }
    const isShowTransit = (row) => {
        return row.stockTransito
            && row.stockTransito.bodega;
    }

    const isButtonTransit = (row) => {
        return !row.stockTransito && !row.loadingStockTransit;
    }
    const isEmptyTransit = () => {
        return false;
    }



    //functiones para consultas de stock bodegas 
    async function fetchStockWarehouse(row, form) {
        const loadingRowStockRef = toRef(row, 'loadingStockWarehouse');
        const payloadWarehouse = {
            articulo: row, // O el campo que necesites
            sucursal_id: form.direccion_facturacion_id, // Asumiendo que tienes esto en tu form
            cliente_id: form.cliente.id,   // Asumiendo que tienes esto
            puntodeventa_id: store.state.puntodeventaselect // O de tu store
        };
        return run(() => axiosClient.post(ARTICLES_API_ROUTES.CONSULT.STOCK, payloadWarehouse), {
            loadingRef: loadingRowStockRef,
            onSuccess: (res) => {
                row.stock = Array.isArray(res.stock) ? res.stock : [];
                row.ART_STOCK = res.ART_STOCK
            },
            successMessage: 'Proceso realizado exitosamente',
        });
    }

    async function fetchStockWarehouseConsult(row) {
        const loadingRowStockRef = toRef(row, 'loadingStockWarehouse');
        const payloadWarehouse = {
            articulo: row, // O el campo que necesites
            sucursal_id: null, // Asumiendo que tienes esto en tu form
            cliente_id: null,   // Asumiendo que tienes esto
            puntodeventa_id: store.state.puntodeventaselect // O de tu store
        };
        return run(() => axiosClient.post(ARTICLES_API_ROUTES.CONSULT.STOCK, payloadWarehouse), {
            loadingRef: loadingRowStockRef,
            successMessage: 'Proceso realizado exitosamente',
        });
    }

    const isShowStock = (row) => {
        return Array.isArray(row.stock)
            && row.stock.length > 0;
    }

    const isButtonStockWarehouse = (row) => {
        return !row.loadingStockWarehouse
            && !row.stock;
    }

    const isEmptyStockWarehouse = (row) => {
        return Array.isArray(row.stock)
            && row.stock.length === 0
            && !row.loadingStockWarehouse;
    }




    //exposicion 
    const isShowStockExposicion = (row) => {
        return row.stockExposicion
            && typeof row.stockExposicion === 'object'
            && row.stockExposicion.disponible !== undefined;
    }

    const isButtonStockExposicion = (row) => {
        return !row.loadingStockExposicion
            && !row.stockExposicion;
    }

    const isEmptyStockExposicion = (row) => {
        return row.stockExposicion?.disponible >= 0;
    }

    async function fetchStockExposicion(row) {
        const loadingRowExposicionRef = toRef(row, 'loadingStockExposicion');
        const payloadExposicion = {
            articulo: row.ART_CODIGO, // O el campo que necesites
            puntoventa: store.state.puntodeventaselect // O de tu store
        };
        return run(() => axiosClient.post(ARTICLES_API_ROUTES.CONSULT.STOCK_EXPOSITION, payloadExposicion), {
            loadingRef: loadingRowExposicionRef,
            onSuccess: (info) => {
                row.stockExposicion = info;
            },
            successMessage: 'Proceso realizado exitosamente',
        });


    }

    /** busacar items l  */
    const loadingSearchItemL = ref(false);
    async function searchItemL(payload) {
        return await run(() => axiosClient.post(ARTICLES_API_ROUTES.ITEMS_L, payload), {
            loadingRef: loadingSearchItemL
        });
    }


    return {
        invalidateArticleSearch,
        payload,
        cols,
        onSort,
        sortBy,
        searchOptions,
        //galeria
        gallery,
        showPhoto,
        handleHide,

        //validacion busqueda
        validateSearch,

        //reset
        resetSearch,

        //busqueda
        articles,
        loadingArt,
        fetchSearchArticles,

        //opciones de articulos
        isSelectable,
        getFinalPrice,

        //opciones transito
        fetchStockTransit,
        isShowTransit,
        isButtonTransit,
        isEmptyTransit,

        //opciones stock bodegas
        fetchStockWarehouse,
        fetchStockWarehouseConsult,
        isShowStock,
        isButtonStockWarehouse,
        isEmptyStockWarehouse,

        //opciones exposicion
        isEmptyStockExposicion,
        isButtonStockExposicion,
        isShowStockExposicion,
        fetchStockExposicion,

        //busqueda de item L 
        searchItemL,
        loadingSearchItemL


    }


}
