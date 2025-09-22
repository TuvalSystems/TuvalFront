
export const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

String.prototype.like = function(search) {
    if (typeof search !== 'string' || this === null) {return false; }
    // Remove special chars
    search = search.replace(new RegExp("([\\.\\\\\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:\\-])", "g"), "\\$1");
    // Replace % and _ with equivalent regex
    search = search.replace(/%/g, '.*').replace(/_/g, '.');
    // Check matches
    return RegExp('^' + search + '$', 'gi').test(this);
}
export const searchLike = (value, searchString, rowData) => {
    const like = searchString.replace(' ', '%');
    return value.like('%'+like+'%');
}


export const onSort = (event, i, cols) => {
    let toset;
    const sortEl = cols[i];
    if (!event.shiftKey) {
        cols.forEach((o) => {
            if (o.field !== sortEl.field) {
                o.sort = "";
            }
        });
    }
    if (!sortEl.sort) {
        toset = "asc";
    }
    if (sortEl.sort === "desc") {
        toset = event.shiftKey ? "" : "asc";
    }
    if (sortEl.sort === "asc") {
        toset = "desc";
    }
    sortEl.sort = toset;
}

export const format4 = (num) => num.toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
});

const format3 = (num) => num.toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
});

export const format = (num) => num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export const formatClean = (num, decimals) => {
  if(decimals === 2)
    return Math.round((num + Number.EPSILON) * 100) / 100
  if(decimals === 3)
    return Math.round((num + Number.EPSILON) * 1000) / 1000
  if(decimals === 4)
    return Math.round((num + Number.EPSILON) * 10000) / 10000
}

export const formatClean3 = (num, decimals) => {
  return Math.round((num + Number.EPSILON) * 1000) / 1000
}

export const formatPrice = (value) => {
    return formatClean(value * 1, 2)//.replace(',','').replace(',','');
    //return (value * 1).toFixed(2);
}

export const formatPriceClean = (value) => {
    return formatClean(value * 1);
    //return (value * 1).toFixed(2);
}
export const formatPrice4 = (value) => {
  return formatClean(value * 1, 4)//.replace(',','').replace(',','');
}
export const formatPrice3 = (value) => {
  return formatClean3(value * 1);
}

export const addDays = (d, qty) =>{
  let dd = d.getDate();
  let mm = d.getMonth() + 1;
  let yyyy = d.getFullYear();
  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  let moreDate = new Date(yyyy, mm - 1, dd);

  let someDate = new Date();
  someDate.setDate(moreDate.getDate() + qty);

  return someDate;
}

export default {removeAccents, searchLike, onSort, formatPrice, formatPrice4, formatPrice3, formatPriceClean, addDays, format, format4}