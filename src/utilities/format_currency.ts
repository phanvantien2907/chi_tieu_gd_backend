export function formatVND(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) {
    return '0 VNĐ';
  }
  return new Intl.NumberFormat('vi-VN').format(numAmount) + ' VNĐ';
}
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) {
    return '0';
  }
  return new Intl.NumberFormat('vi-VN').format(numAmount);
}