export const PAYMENT_AMOUNT_MAX_LENGTH = 12;
export const PAYMENT_AMOUNT_DECIMAL_PLACES = 2;
export const PAYMENT_AMOUNT_MAX_LENGTH_MESSAGE =
  "No puede ingresar un monto excedente de 12 caracteres.";

export function sanitizePaymentAmountInput(
  value,
  {
    maxLength = PAYMENT_AMOUNT_MAX_LENGTH,
    decimalPlaces = PAYMENT_AMOUNT_DECIMAL_PLACES,
  } = {}
) {
  const normalizedValue = String(value ?? "")
    .replace(/,/g, ".")
    .replace(/[^0-9.]/g, "");

  if (!/\d/.test(normalizedValue)) {
    return "";
  }

  const firstDotIndex = normalizedValue.indexOf(".");

  if (firstDotIndex === -1) {
    return normalizedValue.slice(0, maxLength);
  }

  const rawIntegerPart = normalizedValue.slice(0, firstDotIndex);
  const decimalPart = normalizedValue
    .slice(firstDotIndex + 1)
    .replace(/\./g, "")
    .slice(0, decimalPlaces);
  const integerMaxLength = Math.max(
    maxLength - 1 - decimalPart.length,
    0
  );
  const integerPart = rawIntegerPart.slice(0, integerMaxLength);

  return `${integerPart}.${decimalPart}`.slice(0, maxLength);
}

export function handlePaymentAmountInput(payload, field, event, options = {}) {
  const sanitizedValue = sanitizePaymentAmountInput(
    event?.target?.value,
    options
  );

  payload[field] = sanitizedValue;

  if (event?.target && event.target.value !== sanitizedValue) {
    event.target.value = sanitizedValue;
  }

  return sanitizedValue;
}
