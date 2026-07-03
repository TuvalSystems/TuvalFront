<script setup>
import { onMounted } from 'vue';
onMounted(() => { });
</script>

<template>
  <BasePageHeading title="Depositós Históricos">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Cobranzas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Depositós Históricos</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>

  <div class="content">
    <BaseBlock title="Depositós Históricos" content-full rounded>
      <template #options>
        <div class="block-options-item">
          <button class="btn btn-outline-primary btn-sm">
            <i class="fa fa-refresh"></i>
          </button>
        </div>
      </template>
    </BaseBlock>
  </div>
</template>

<style lang="css" scoped></style>
