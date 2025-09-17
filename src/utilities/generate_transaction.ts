export async function generateTransactionReference(
  paymentProvider: 'vnpay' | 'momo' | 'visa' | 'bank' | 'test' = 'test',
  transactionType: 'deposit' | 'withdrawal' | 'refund' = 'deposit',
  userId?: string
): Promise<string> {
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  let prefix = '';
  switch(paymentProvider.toLowerCase()) {
    case 'vnpay': prefix = 'VNP'; break;
    case 'momo': prefix = 'MOM'; break;
    case 'visa': prefix = 'VISA'; break;
    case 'bank': prefix = 'BANK'; break;
    case 'test': prefix = 'TEST'; break;
    default: prefix = 'PAY';
  }
  let typeSuffix = '';
  switch(transactionType) {
    case 'deposit': typeSuffix = 'DEP'; break;
    case 'withdrawal': typeSuffix = 'WIT'; break;
    case 'refund': typeSuffix = 'REF'; break;
    default: typeSuffix = 'TXN';
  }
  const userSuffix = userId ? userId.substring(0, 4) : '';
  return `${prefix}_${typeSuffix}_${timestamp}_${randomStr}${userSuffix}`;
}