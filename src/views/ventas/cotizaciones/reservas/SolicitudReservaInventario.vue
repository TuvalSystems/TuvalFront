<script setup>
import { onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter } from "vue-router";
import { useTemplateStore } from "@/stores/template";
const props = defineProps({
    id: { type: String, required: true } // ya viene de la ruta
});

const route = useRouter();

// Main store
const templateStore = useTemplateStore();
let timer;

function startLoadingDelay() {
    // por si llegas directo con URL, asegura que esté ON
    templateStore.pageLoader({ mode: 'on' })
    clearTimeout(timer)
    timer = setTimeout(() => {
        templateStore.pageLoader({ mode: 'off' })
    }, 5000) // 5 segundos
}


onMounted(startLoadingDelay)
onBeforeUnmount(() => {
    clearTimeout(timer);
    templateStore.pageLoader({ mode: "off" });
});
watch(() => props.id, () => {
    startLoadingDelay();
});
</script>
<template>
    <h1>Solicitud de Reserva de Inventario #{{ props.id }}</h1>
    <BasePageHeading title="Solicitar Reserva">
        <template #extra>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb breadcrumb-alt">
                    <li class="breadcrumb-item">
                        <a class="link-fx" href="javascript:void(0)">Cotizaciones</a>
                    </li>
                    <li class="breadcrumb-item" aria-current="page">Solicitar Reserva</li>
                </ol>
            </nav>
        </template>
    </BasePageHeading>
</template>