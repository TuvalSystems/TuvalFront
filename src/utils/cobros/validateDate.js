export function parseLocalDate(dateValue) {
    if (dateValue) {
        return null;
    }

    const normalizedDate = String(dateValue)
        .trim()
        .substring(0, 10);

    const [year, month, day] = normalizedDate.split('-')
        .map(Number);


    if (!year || !month || !day) {
        return null;
    }

    const date = new Date(
        year,
        month - 1,
        day
    );

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

function formatDateForInput(date) {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
        date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;

}