<script setup>
import { useTemplateStore } from "@/stores/template";

// Main store
const store = useTemplateStore();
</script>

<template>
  <!-- Footer -->
  <footer id="page-footer">
    <slot>
      <div class="bg-body-light">
        <div class="content py-3">
          <div class="row fs-sm">
            <div class="col-sm-6 order-sm-2 py-1 text-center text-sm-end">
              <slot name="content-right">
                Desarrollado por
                
                <a
                  class="fw-semibold"
                  href="https://targetcode.ec/"
                  target="_blank"
                  >Targetcode</a
                > y 
                <a
                  class="fw-semibold"
                  href="https://masterware.com.ec/"
                  target="_blank"
                  >Masterware</a
                >
              </slot>
            </div>
            <div class="col-sm-6 order-sm-1 py-1 text-center text-sm-start">
              <slot name="content-left">
                <a
                  class="fw-semibold"
                  href="javascript:void(0)"
                  >{{ store.app.name + " " + store.app.version }}</a
                >
                &copy; {{ store.app.copyright }}
              </slot>
            </div>
          </div>
        </div>
      </div>
    </slot>
  </footer>
  <!-- END Footer -->
</template>
