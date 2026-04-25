<template>
    <!-- Hero -->
    <BasePageHeading title="Consultas" subtitle="Consulta de artículos, clientes, direcciones">
        <template #extra>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb breadcrumb-alt">
                    <li class="breadcrumb-item">
                        <a class="link-fx" href="javascript:void(0)">Ventas</a>
                    </li>
                    <li class="breadcrumb-item" aria-current="page">Consultas</li>
                </ol>
            </nav>
        </template>
    </BasePageHeading>
    <!-- END Hero -->

    <!-- Page Content -->
    <div class="content">
        <div class="row">
            <div class="row">
                <div class="col-md-12">
                    <!-- Block Tabs Default Style -->
                    <BaseBlock>
                        <template #content>
                            <ul class="nav nav-tabs nav-tabs-block">
                                <li class="nav-item">
                                    <button class="nav-link active" id="btabs-articulos-tab" data-bs-toggle="tab"
                                        data-bs-target="#btabs-articulos" role="tab" aria-controls="btabs-articulos"
                                        aria-selected="true">
                                        Artículos
                                    </button>
                                </li>
                                <li class="nav-item">
                                    <button class="nav-link" id="btabs-clientes-tab" data-bs-toggle="tab"
                                        data-bs-target="#btabs-clientes" role="tab" aria-controls="btabs-clientes"
                                        aria-selected="false">
                                        Clientes
                                    </button>
                                </li>
                            </ul>
                            <div class="block-content tab-content">
                                <!-- articulos -->
                                <div class="tab-pane active" id="btabs-articulos" role="tabpanel"
                                    aria-labelledby="btabs-articulos-tab">
                                    <verTabArticulos></verTabArticulos>
                                </div>
                                <!-- clientes -->
                                <div class="tab-pane" id="btabs-clientes" role="tabpanel"
                                    aria-labelledby="btabs-clientes-tab">
                                    <verTabCliente></verTabCliente>
                                </div>
                            </div>
                        </template>
                    </BaseBlock>
                    <!-- END Block Tabs Default Style -->
                </div>
            </div>
            <!-- END Block Tabs -->
        </div>
    </div>
    <!-- END Page Content -->
</template>
<script setup>
import verTabArticulos from "@/views/ventas/modals/tabs/consultas/ArticulosTab.vue";
import verTabCliente from "@/views/ventas/modals/tabs/consultas/ClienteTab.vue";
</script>