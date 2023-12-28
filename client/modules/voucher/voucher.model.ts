export interface IVoucher {
  id: string;
  tag: string;
  value: number;
  maxUsageNumber: number;
  used: number;
  createdBy: string | number;
  createdAt: Date | string;
  expireAt: Date | string;
  qrUrl?: string;
}