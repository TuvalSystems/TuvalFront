import { echo } from "@/resources/echo";

export function useDashboardEvents({
    refreshFn,
    debounceMs = 350,
    onSubscribed,
    onEvent,
    onError,
} = {}) {
    let timer;

    const notificationSound = new Audio('/sounds/notificacion.mp3');
    notificationSound.volume = 1.0;
    notificationSound.preload = 'auto';

    const playNotification = () => {
        notificationSound.currentTime = 0;

        const playPromise = notificationSound.play();
        if(playPromise !== undefined) {
            playPromise.catch((error) => {
                console.log("El TV bloqueó el sonido automático:", error); 
            });
        }
    }

    // const unlockSound = () => {
    //     notificationSound.play().then(() => {
    //         notificationSound.pause();
    //         notificationSound.currentTime = 0;
    //     }).catch((error) => {
    //         console.log("Reproduccion de sonido bloqueda por falta de interaccion de usuario");
    //     });
    // }

    // document.addEventListener('click', unlockSound, { once: true });



    const chan = echo.channel('refresh-dashboard-dispatch-pendings');

    if (typeof onSubscribed === 'function') {
        chan.subscribed(onSubscribed);
    }

    if (typeof onError === "function") {
        chan.error(onError);
    }

    chan.listen(".dispatch.updated", (e) => {
        playNotification();
        if (typeof onEvent === "function") onEvent(e);
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (typeof refreshFn === "function") refreshFn();
        }, debounceMs);
    });

    return () => {
        clearTimeout(timer);
        // document.removeEventListener('click', unlockSound);
        try {
            echo.leave("refresh-dashboard-dispatch-pendings");
        } catch (error) {
            if (typeof onError === "function") onError(error);
        }
    };
}
