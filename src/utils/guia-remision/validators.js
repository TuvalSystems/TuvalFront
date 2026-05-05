function isBlank(v) {
    return v == null || (typeof v === "string" && v.trim() === "");
}

function validarPlacaEC(placa) {
    return /^[A-Z]{3}-?\d{4}$/.test(String(placa).toUpperCase().trim());
}

function toDate(s) {
    return new Date(s);
}

function isValidDateStr(s) {
    const d = new Date(s);
    return !Number.isNaN(d.getTime());
}

export { isBlank, validarPlacaEC, toDate, isValidDateStr };