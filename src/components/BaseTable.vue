<script setup>
import { computed } from "vue";

const props = defineProps({
    columns: {
        type: Array,
        required: true,
    },
    data: {
        type: Array,
        required: true,
    },
    loading: {
        type: Boolean,
        default: false,
    },

    totalItems: {
        type: Number,
        default: 0,
    },
    currentPage: {
        type: Number,
        default: 1,
    },
    totalPage: {
        type: Number,
        default: 0,
    },
    perPage: {
        type: String,
        default: "10",
    },
    sortable: {
        type: Boolean,
        default: false,
    },
    sortField: {
        type: String,
        default: "",
    },
    sortOrder: {
        type: String,
        default: "asc",
    },
    processing: { type: Boolean, default: false },
    isRowDisabled: { type: Function, default: null },

});

const emit = defineEmits(["onSort", "onPageChange", "onClick"]);

//ordenamiento
const handleSort = (field) => {
    const newOrder = props.sortOrder === "asc" ? "desc" : "asc";
    emit("onSort", { field, order: newOrder });
};

//obtener el icono correcto
const getSortIcon = (field) => {
    if (props.sortField !== field) {
        return "fa fa-angle-down";
    }
    return props.sortOrder === "asc" ? "fa fa-angle-up" : "fa fa-angle-down";
};

// Paginación
const pages = computed(() => {
    const range = [];
    const maxVisiblePages = 5;
    let start = Math.max(1, props.currentPage - Math.floor(maxVisiblePages / 2));
    let end = Math.min(props.totalPage, start + maxVisiblePages - 1);

    if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
        range.push(i);
    }
    return range;
});


const isDisabledRow = (row) => (props.isRowDisabled ? !!props.isRowDisabled(row) : false);
const isCellClickable = (row, col) => col.clickable && !props.processing && !isDisabledRow(row);

const handleRowClick = (event, row, col) => {
    event.preventDefault();
    if (!isCellClickable(row, col)) return; // ⛔ bloquea si está en procesamiento o fila deshabilitada
    emit('onClick', { row, col });
};


//** para el manejo de clases definida por el componente padre */
const normalizeClass = (cls) => {
    if (!cls) return [];
    if (Array.isArray(cls)) return cls.filter(Boolean);
    if (typeof cls === "object") return [cls];
    return [cls]; //string 
};


const getThClass = (col) => {
    return [
        "text-left",
        "text-nowrap",
        col.sortable ? "sortable" : "",
        ...normalizeClass(col.thClass),
    ].filter(Boolean);
};

const getTdClass = (col, row) => {
    const extra = typeof col.tdClass === "function" ? col.tdClass(row) : col.tdClass;
    return [
        "text-left", ...normalizeClass(extra)].filter(Boolean);
};



</script>

<template>
    <div class="row">
        <div class="col-md-12">
            <div class="table-responsive">
                <table class="table table-sm table-hover table-vcenter">
                    <thead>
                        <tr>
                            <th v-for="col in columns" :key="col.key" @click="col.sortable ? handleSort(col.key) : null"
                                :class="getThClass(col)" :style="{ fontSize: '12px', width: col.width ?? 'auto' }">
                                <div class="d-flex align-items-center justify-content-between gap-2">
                                    <span>{{ col.label }}</span>
                                    <i v-if="col.sortable" :class="getSortIcon(col.key)"></i>
                                </div>
                            </th>
                            <!-- Si hay acciones, se añade una columna adicional -->
                            <th v-if="$slots.actions" class="text-center nowrap" style="font-size: 12px">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody v-if="loading">
                        <tr>
                            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="text-center py-5">
                                <div class="spinner-border text-primary">
                                    <span class="visually-hidden">Cargando...</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else-if="!loading && (!data || !data.length)">
                        <tr>
                            <td :colspan="columns.length + ($slots.actions ? 1 : 0)"
                                class="text-center py-4 text-muted">
                                <slot name="empty">Sin registros para mostrar.</slot>
                            </td>
                        </tr>
                    </tbody>

                    <!-- datos de la tabla  y acciones -->
                    <transition-group name="fade" tag="tbody" class="fs-sm" v-else>
                        <tr v-for="(row, index) in data" :key="row.id ?? index">
                            <td v-for="col in columns" :key="col.key" :class="getTdClass(col, row)"
                                style="font-size: 12px;">

                                <!-- 👇 slot específico por columna -->
                                <template v-if="$slots[`cell-${col.key}`]">
                                    <slot :name="`cell-${col.key}`" :row="row" :col="col" :value="row[col.key]" />
                                </template>

                                <!-- Si es clickable, lo renderizamos como enlace -->
                                <template v-else>
                                    <a v-if="col.clickable" href="javascript:void(0)"
                                        :class="['clickable', (processing || isDisabledRow(row)) ? 'is-disabled' : '']"
                                        :aria-disabled="processing || isDisabledRow(row)"
                                        :tabindex="(processing || isDisabledRow(row)) ? -1 : 0"
                                        @click="(event) => handleRowClick(event, row, col)">
                                        <span v-if="typeof col.render === 'function'">
                                            {{ col.render(row[col.key]) }}
                                        </span>
                                        <span v-else>
                                            {{ row[col.key] }}
                                        </span>
                                    </a>

                                    <!-- Caso normal -->
                                    <span v-else>
                                        {{ row[col.key] }}
                                    </span>
                                </template>
                            </td>

                            <!-- Slot para acciones -->
                            <td v-if="$slots.actions" class="text-center text-nowrap" style="width:1%;">
                                <slot name="actions" :row="row"></slot>
                            </td>
                        </tr>
                    </transition-group>
                </table>

                <!-- Paginacion Integrada -->
                <div class="d-flex justify-content-between align-items-center mt-3 mb-3 px-2">
                    <div class="d-none d-sm-block">
                        <p class="mb-0 fs-sm">
                            Mostrando
                            <strong>{{ (currentPage - 1) * perPage + 1 }}</strong> a
                            <strong>{{ Math.min(currentPage * perPage, totalItems) }}</strong>
                            de <strong>{{ totalItems }}</strong> registros
                        </p>
                    </div>

                    <nav>
                        <ul class="pagination pagination-sm mb-0">
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <button class="page-link" @click="$emit('onPageChange', 1)">
                                    <i class="fa fa-angle-double-left"></i>
                                </button>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <button class="page-link" @click="$emit('onPageChange', currentPage - 1)">
                                    <i class="fa fa-angle-left"></i>
                                </button>
                            </li>

                            <li v-for="page in pages" :key="page" class="page-item"
                                :class="{ active: page === currentPage }">
                                <button class="page-link" @click="$emit('onPageChange', page)">
                                    {{ page }}
                                </button>
                            </li>

                            <li class="page-item" :class="{ disabled: currentPage === totalPage }">
                                <button class="page-link" @click="$emit('onPageChange', currentPage + 1)">
                                    <i class="fa fa-angle-right"></i>
                                </button>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === totalPage }">
                                <button class="page-link" @click="$emit('onPageChange', totalPage)">
                                    <i class="fa fa-angle-double-right"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Transiciones */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}


/* Estilos de tabla base */
.table-responsive {
    max-height: 700px;
    overflow-y: auto;
}

.overlay-loading {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
}



/* icono de ordenamiento */
.sortable {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s, color 0.2s;
}

.sortable:hover {
    color: #0d6efd;
}

/* Links clickeables */
.clickable {
    cursor: pointer;
    color: var(--bs-primary);
    /* Usa la variable de Bootstrap */
    text-decoration: none;
    font-weight: 500;
}

.clickable:hover {
    text-decoration: underline;
}

.clickable.is-disabled {
    pointer-events: none;
    opacity: 0.6;
    cursor: not-allowed;
    color: inherit;
}

th,
td {
    padding: 4px 8px !important;
}

.text-nowrap {
    white-space: nowrap;
}

td {
    vertical-align: middle;
}

/* Modo Light (Por defecto) */
th.sortable:hover {
    background-color: rgba(0, 0, 0, 0.05);
    /* Gris muy suave */
    color: var(--bs-primary);
}

:global(.dark-mode) .block,
:global(.dark-mode) .card,
:global([data-bs-theme="dark"]) .block,
:global([data-bs-theme="dark"]) .card {
    background-color: #262c35 !important;
    /* El color oscuro estándar de OneUI */
    color: #dfe3ea !important;
    /* Texto gris claro */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
    /* Ajuste opcional de sombra */
}

/* Si el bloque tiene un header específico, también lo oscurecemos */
:global(.dark-mode) .block-header,
:global([data-bs-theme="dark"]) .block-header {
    background-color: #21262d !important;
    /* Un tono ligeramente más oscuro para el título */
    color: #fff !important;
}
</style>
