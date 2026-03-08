export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  label: string;
  active: boolean;
  usageCount: number;
  maxUses: number | null; // null = unlimited
  expiresAt: string | null; // ISO date or null
}

let coupons: Coupon[] = [
  { id: "1", code: "DOCE10", type: "percent", value: 10, minOrder: 30, label: "10% de desconto", active: true, usageCount: 24, maxUses: null, expiresAt: null },
  { id: "2", code: "PRIMEIRACOMPRA", type: "percent", value: 15, minOrder: 0, label: "15% na primeira compra", active: true, usageCount: 58, maxUses: 100, expiresAt: "2026-06-30" },
  { id: "3", code: "FRETE", type: "fixed", value: 8, minOrder: 50, label: "Frete grátis", active: true, usageCount: 12, maxUses: null, expiresAt: null },
  { id: "4", code: "ECONOMIA5", type: "fixed", value: 5, minOrder: 20, label: "R$ 5 de desconto", active: false, usageCount: 45, maxUses: 50, expiresAt: "2026-03-01" },
];

export function getCoupons() {
  return [...coupons];
}

export function getActiveCoupons() {
  return coupons.filter((c) => c.active);
}

export function addCoupon(coupon: Omit<Coupon, "id" | "usageCount">) {
  const newCoupon: Coupon = { ...coupon, id: crypto.randomUUID(), usageCount: 0 };
  coupons = [...coupons, newCoupon];
  return newCoupon;
}

export function updateCoupon(id: string, data: Partial<Omit<Coupon, "id">>) {
  coupons = coupons.map((c) => (c.id === id ? { ...c, ...data } : c));
}

export function toggleCouponActive(id: string) {
  coupons = coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c));
}

export function deleteCoupon(id: string) {
  coupons = coupons.filter((c) => c.id !== id);
}
