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
        type: Number,
        default: 0,
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
        return "fa fa-caret-down";
    }
    return props.sortOrder === "asc" ? "fa fa-caret-up" : "fa fa-caret-down";
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


const handleRowClick = (event, row, col) => {
    event.preventDefault();
    // console.log('🟢 CLICK detectado en BaseTable:', row, col.key);
    emit('onClick', { row, col });
    // console.log('🟡 Evento emitido desde BaseTable');
};
</script>

<template>
    <div class="row">
        <div class="col-md-12"></div>
        <div class="table-responsive">
            <table class="table table-sm table-hover table-vcenter mb-0">
                <thead>
                    <tr>
                        <th v-for="col in columns" :key="col.key" @click="col.sortable ? handleSort(col.key) : null"
                            :class="col.sortable ? 'sortable' : ''" class="text-left text-nowrap"
                            style="font-size: 12px">
                            {{ col.label }}
                            <i :class="getSortIcon(col.key)" class="ms-1"></i>
                        </th>
                        <!-- Si hay acciones, se añade una columna adicional -->
                        <th v-if="$slots.actions" class="text-center" style="font-size: 12px">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody v-if="loading">
                    <tr>
                        <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                        </td>
                    </tr>
                </tbody>

                <!-- datos de la tabla  y acciones -->
                <transition-group name="fade" tag="tbody" class="fs-sm" v-else>
                    <tr v-for="row in data" :key="row.id ?? index">
                        <td v-for="col in columns" :key="col.key" class="text-left"
                            style="font-size: 12px; overflow: hidden; text-overflow: ellipsis">


                            <!-- Si es clickable, lo renderizamos como enlace -->
                            <a v-if="col.clickable" href="javascript:void(0)"
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
                        </td>

                        <!-- Slot para acciones -->
                        <td v-if="$slots.actions" class="text-center text-nowrap" style="width: 150px">
                            <slot name="actions" :row="row"></slot>
                        </td>
                    </tr>
                </transition-group>
            </table>

            <!-- Paginacion Integrada -->
            <div class="d-flex justify-content-between align-items-center mt-3 mb-3">
                <div>
                    <p class="mb-0 text-white" style="font-size: 12px">
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
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
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
}

.sortable:hover {
    color: #0d6efd;
}

.clickable {
    cursor: pointer;
    color: #0d6efd;
}

/* table */
.table-responsive {
    max-height: 600px;
    overflow-y: auto;
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

th.sortable:hover {
    background-color: #1e293b;
    cursor: pointer;
}
</style>
