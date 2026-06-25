// Formats a number as Nigerian Naira, e.g. 150000 -> "₦150,000.00"
export function formatCurrency(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return '₦0.00';
  return (
    '₦' +
    amount.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export default formatCurrency;
