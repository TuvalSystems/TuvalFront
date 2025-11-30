<script setup>
import BaseTable from "@/components/BaseTable.vue";
import { onMounted, reactive, ref, onBeforeUnmount, nextTick } from "vue";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { Modal } from "bootstrap";
import {
    swalWarning,
    swalError,
} from "@/functions/swal-alert.js";

const flatPickrState = reactive({
    fecha_desde: {
        // maxDate: Date.now(),
        locale: Spanish,
    },
    fecha_hasta: {
        // maxDate: Date.now(),
        locale: Spanish,
    },
});

onMounted(() => { });
</script>

<template>
    <BasePageHeading title="Reservas">
        <template #extra>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb breadcrumb-alt">
                    <li class="breadcrumb-item">
                        <a class="link-fx" href="javascript:void(0)">Ventas</a>
                    </li>
                    <li class="breadcrumb-item" aria-current="page">Pedidos_Reservas</li>
                </ol>
            </nav>
        </template>
    </BasePageHeading>
</template>

<style lang="css" scoped></style>
