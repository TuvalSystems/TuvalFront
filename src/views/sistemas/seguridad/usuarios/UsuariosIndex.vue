<script setup lang="ts">
import { onMounted } from 'vue';
onMounted(() => { });
</script>

<template>
  <BasePageHeading title="Gestión de Usuarios">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Sistemas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Seguridad</li>
          <li class="breadcrumb-item" aria-current="page">Usuarios</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <div class="content">
    <BaseBlock title="Lista de Usuarios" content-full rounded>

    </BaseBlock>
  </div>
</template>
