<script setup>
const emit = defineEmits(["cargar", "eliminar"]);
const props = defineProps({
    borradores: {
        type: Array,
        required: true,
        default: () => []
    }
});


const formatMoney = (val) => Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 });
const formatFecha = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};
</script>

<template>
    <BaseBlock title="Lista de Borradores" class="mb-0" transparent>
        <template #options>
            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
                <i class="fa fa-fw fa-times"></i>
            </button>
        </template>

        <template #content>
            <div class="block-content p-0">
                <div class="table-responsive">
                    <table class="table table-vcenter table-hover mb-0">
                        <thead class="text-uppercase border-bottom border-white-op-10">
                            <tr>
                                <th class="text-center text-muted fs-xs" style="width: 50px;">#</th>
                                <th class="fs-xs text-muted" style="width: 180px;">Modificado</th>
                                <th class="fs-xs text-muted">Cliente / Razón Social</th>
                                <th class="text-center fs-xs text-muted" style="width: 100px;">Items</th>
                                <th class="text-end fs-xs text-muted" style="width: 120px;">Total Ref.</th>
                                <th class="text-center fs-xs text-muted" style="width: 100px;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="fs-sm">
                            <tr v-for="(draft, index) in props.borradores" :key="draft.draft_id">
                                <td class="text-center text-muted">{{ index + 1 }}</td>
                                <td class="text-muted">
                                    <i class="far fa-clock me-1"></i> {{ formatFecha(draft.created_temp_at) }}
                                </td>
                                <td class="fw-semibold">
                                    {{ draft.cliente || 'Borrador sin cliente' }}
                                </td>
                                <td class="text-center">
                                    <span class="badge bg-white-op-10 text-muted rounded-pill">
                                        {{ draft.items_count || 0 }}
                                    </span>
                                </td>
                                <td class="text-end fw-bold text-success">
                                    $ {{ formatMoney(draft.total || 0) }}
                                </td>
                                <td class="text-center">
                                    <div class="btn-group">
                                        <button type="button" class="btn btn-sm btn-alt-primary"
                                            @click="emit('cargar', draft.draft_id)" title="Cargar Borrador">
                                            <i class="fa fa-folder-open"></i>
                                        </button>
                                        <button type="button" class="btn btn-sm btn-alt-danger"
                                            @click="emit('eliminar', draft.draft_id)" title="Eliminar">
                                            <i class="fa fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="props.borradores.length === 0">
                                <td colspan="6" class="text-center py-5 text-muted bg-body-extra-light">
                                    No se encontraron borradores guardados.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="block-content block-content-full block-content-sm bg-body-light fs-xs text-muted">
                <i class="fa fa-info-circle me-1 text-primary"></i>
                Los borradores se auto-limpian después de 60 días de inactividad.
            </div>
        </template>
    </BaseBlock>
</template>
