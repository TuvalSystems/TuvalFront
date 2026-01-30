import { ref, onMounted, onUnmounted} from "vue";
import { Modal } from "bootstrap";

export function useBootstrapModal(elementRef, options ={ backdrop: true}){
    let modalInstance = null;

    // Inicializamos el modal cuando el componente se monta
    onMounted(()=>{
        if(elementRef.value){
           modalInstance = Modal.getOrCreateInstance(elementRef.value, options);
        }
    });

    //Limpiamos la instacia cuando el componente se destruye
    onUnmounted(()=>{
        if (modalInstance) {
            modalInstance.dispose();
            modalInstance = null;
        }
    });

    const show = () => {
            modalInstance.show();
    };

    const hide = ()=> {
        modalInstance.hide();
    }

    const toggle = () => {
        modalInstance.toggle();
    }

    return {
        show,
        hide,
        toggle
    }
}