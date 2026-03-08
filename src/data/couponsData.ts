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

// Analytics mock data
export interface CouponUsageDay {
  date: string;
  uses: number;
  revenue: number;
  discount: number;
}

export interface CouponStats {
  couponId: string;
  code: string;
  totalUses: number;
  totalRevenue: number;
  totalDiscount: number;
  conversionRate: number; // % of views that used the coupon
  avgOrderValue: number;
  dailyUsage: CouponUsageDay[];
}

export function getCouponAnalytics(days = 14): CouponStats[] {
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return d.toISOString().split("T")[0];
  });

  return coupons.map((c) => {
    const baseUses = c.usageCount;
    const avgOrder = c.type === "percent" ? 85 + Math.random() * 40 : 55 + Math.random() * 30;
    const avgDisc = c.type === "percent" ? avgOrder * (c.value / 100) : c.value;

    const dailyUsage: CouponUsageDay[] = last14Days.map((date) => {
      const uses = c.active ? Math.floor(Math.random() * 6) + 1 : Math.floor(Math.random() * 2);
      return {
        date,
        uses,
        revenue: Math.round(uses * avgOrder * 100) / 100,
        discount: Math.round(uses * avgDisc * 100) / 100,
      };
    });

    const totalUses = dailyUsage.reduce((s, d) => s + d.uses, 0);
    const totalRevenue = dailyUsage.reduce((s, d) => s + d.revenue, 0);
    const totalDiscount = dailyUsage.reduce((s, d) => s + d.discount, 0);

    return {
      couponId: c.id,
      code: c.code,
      totalUses,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      conversionRate: Math.round((15 + Math.random() * 35) * 10) / 10,
      avgOrderValue: Math.round(avgOrder * 100) / 100,
      dailyUsage,
    };
  });
}

export function getAggregatedDailyUsage() {
  const analytics = getCouponAnalytics();
  const dayMap: Record<string, { date: string; uses: number; revenue: number; discount: number }> = {};

  for (const stat of analytics) {
    for (const day of stat.dailyUsage) {
      if (!dayMap[day.date]) {
        dayMap[day.date] = { date: day.date, uses: 0, revenue: 0, discount: 0 };
      }
      dayMap[day.date].uses += day.uses;
      dayMap[day.date].revenue += day.revenue;
      dayMap[day.date].discount += day.discount;
    }
  }

  return Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));
}
