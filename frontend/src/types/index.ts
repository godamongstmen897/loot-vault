export type AssetStatus = "active" | "pending" | "locked" | "settled";

export interface Asset {
  id: string;
  name: string;
  amount: string;
  value: string;
  icon: string;
  status: AssetStatus;
  description?: string;
}
