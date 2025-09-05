export function formatDate(date: string | Date) {
  const fm  = new Date(date);
  const date_time = fm.toLocaleDateString('vi-VN');
  const time =fm.toLocaleTimeString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
  });
  return `${date_time} ${time}`;
}