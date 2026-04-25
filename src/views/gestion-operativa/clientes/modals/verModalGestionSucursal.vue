
<script setup lang="ts">
import { onMounted } from 'vue';
const props = defineProps({
    sucursal: {
        type: Object,
        required: true,
    },
})
onMounted(() => {});
</script>

<template>
    <BaseBlock ></BaseBlock>
  <div>
    {{ sucursal }}
  </div>
</template>

<style lang="css" scoped>
</style>
