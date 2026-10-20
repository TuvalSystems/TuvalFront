const BASE_BADGE_CLASS = "badge rounded-pill border fw-semibold px-3 py-2";

const BADGE_VARIANTS = {
    success: "bg-success-subtle text-success border-success-subtle",
    danger: "bg-danger-subtle text-danger border-danger-subtle",
    warning: "bg-warning-subtle text-warning border-warning-subtle",
    primary: "bg-primary-subtle text-primary border-primary-subtle",
    info: "bg-info-subtle text-info border-info-subtle",
    dark: "bg-dark-subtle text-dark border-dark-subtle",
    secondary: "bg-secondary-subtle text-secondary border-secondary-subtle",
};

const COMMON_STATUS_MAP = {
    pendiente: "dark",
    aprobado: "success",
    aprobada: "success",
    rechazada: "danger",
    rechazado: "danger",
    cancelada: "warning",
    cancelado: "warning",
    procesado: "primary",
    traslado: "info",

    //cobros
    enviado: "success",
    revisado: "secondary",
    iniciado: "info",


};

const STATUS_MAPS = {
    boolean: {
        "1": "success",
        "0": "danger",
        "true": "success",
        "false": "danger",
        activo: "success",
        inactivo: "danger",
        si: "success",
        no: "danger",
    },

    documento: {
        ...COMMON_STATUS_MAP,
        espera: "danger",
        facturado: "primary",
        order_de_compra: "primary",
        orden_de_compra: "primary",
    },

    despacho: {
        ...COMMON_STATUS_MAP,
        facturado: "success",
        order_de_compra: "primary",
        orden_de_compra: "primary",
    },
    dispatchOrder: {
        pendiente: "warning",
        liberada: "primary",
        despachada: "success",
        cancelada: "danger",
    },
    log: {
        success: "success",
        pending: "dark",
        resolved: "success",
        failed: "danger",
        warning: "warning",
    },
    booleanInverted: {
        "1": "danger",
        "0": "success",
        "true": "danger",
        "false": "success",
        activo: "danger",
        inactivo: "success",
        si: "danger",
        no: "success",
    },
    cobros: {
        enviado: "success",
        revisado: "secondary",
        iniciado: "danger",
        rechazado: "danger",
        no_enviado: "warning"
    },
    proveedor: {
        activo: "success",
        inactivo: "danger",
    }

};

function normalizeStatus(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim().toLowerCase();
}

export function getBadgeClassByVariant(variant = "secondary") {
    const variantClass = BADGE_VARIANTS[variant] ?? BADGE_VARIANTS.secondary;

    return `${BASE_BADGE_CLASS} ${variantClass}`;
}

export function getStatusBadgeClass(status, type = "documento") {
    const normalizedStatus = normalizeStatus(status);
    const map = STATUS_MAPS[type] ?? STATUS_MAPS.documento;

    const variant = map[normalizedStatus] ?? "secondary";

    return getBadgeClassByVariant(variant);
}
