// utils/FormatUtils.js

export function formatNumber(num) {
  if (num < 1000) return num.toString();

  const units = ["K", "M", "B", "T"];
  let unitIndex = -1;

  let formatted = num;
  while (formatted >= 1000 && unitIndex < units.length - 1) {
    formatted /= 1000;
    unitIndex++;
  }

  return `${formatted.toFixed(1)}${units[unitIndex]}`;
}

// إضافة فواصل 1,234,567
export function numberWithCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
