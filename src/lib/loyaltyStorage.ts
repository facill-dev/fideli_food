// ─── Loyalty System — Multi-tenant fidelization ──────────────

// ─── Types ───────────────────────────────────────

export interface LoyaltyGlobalConfig {
  enabled: boolean;
  pointsEnabled: boolean;
  cashbackEnabled: boolean;
  allowTenantCustomization: boolean;
  allowManualAdjustments: boolean;
  allowCombineWithCoupon: boolean;
  maxPointsPerReal: number;
  maxCashbackPercent: number;
  maxCashbackPerOrder: number;
  maxDiscountPercentPerOrder: number;
  defaultExpirationDays: number;
  releaseOn: "delivered" | "confirmed";
}

export interface LoyaltyStoreConfig {
  storeId: string;
  enabled: boolean;
  programName: string;
  programDescription: string;
  pointsEnabled: boolean;
  pointsPerReal: number;
  pointsRedemptionRate: number; // e.g. 100 pts = R$10 → rate = 10
  minOrderForPoints: number;
  maxPointsPerOrder: number;
  pointsExpirationDays: number; // 0 = no expiration
  cashbackEnabled: boolean;
  cashbackPercent: number;
  minOrderForCashback: number;
  maxCashbackPerOrder: number;
  cashbackExpirationDays: number;
  minPointsToRedeem: number;
  maxDiscountPercentPerOrder: number;
  allowCombinePointsAndCashback: boolean;
  allowCombineWithCoupon: boolean;
  releaseOn: "delivered" | "confirmed";
}

export interface LoyaltyWallet {
  id: string;
  storeId: string;
  customerId: string; // phone
  customerName: string;
  pointsBalance: number;
  pointsPending: number;
  cashbackBalance: number;
  cashbackPending: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  totalPointsExpired: number;
  totalCashbackEarned: number;
  totalCashbackUsed: number;
  totalCashbackExpired: number;
  lastMovementAt: string;
}

export type MovementAction =
  | "credit_pending"
  | "credit_released"
  | "debit_redeem"
  | "debit_expiration"
  | "debit_reversal"
  | "manual_credit"
  | "manual_debit";

export interface LoyaltyMovement {
  id: string;
  storeId: string;
  walletId: string;
  customerId: string;
  type: "points" | "cashback";
  action: MovementAction;
  amount: number;
  balanceAfter: number;
  orderId?: string;
  campaignId?: string;
  reason?: string;
  performedBy?: string;
  createdAt: string;
}

export interface LoyaltyCampaign {
  id: string;
  storeId: string;
  name: string;
  description: string;
  type: "points_multiplier" | "cashback_bonus";
  multiplier?: number;
  bonusPercent?: number;
  startDate: string;
  endDate: string;
  active: boolean;
  minOrder: number;
}

// ─── Keys ────────────────────────────────────────

const KEYS = {
  global: "mt_loyalty_global",
  configs: "mt_loyalty_configs",
  wallets: "mt_loyalty_wallets",
  movements: "mt_loyalty_movements",
  campaigns: "mt_loyalty_campaigns",
};

function getList<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function setList<T>(key: string, data: T[]) { localStorage.setItem(key, JSON.stringify(data)); }
function genId(): string { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

// ─── Global Config ───────────────────────────────

const DEFAULT_GLOBAL: LoyaltyGlobalConfig = {
  enabled: true,
  pointsEnabled: true,
  cashbackEnabled: true,
  allowTenantCustomization: true,
  allowManualAdjustments: true,
  allowCombineWithCoupon: true,
  maxPointsPerReal: 10,
  maxCashbackPercent: 15,
  maxCashbackPerOrder: 50,
  maxDiscountPercentPerOrder: 30,
  defaultExpirationDays: 90,
  releaseOn: "delivered",
};

export function getGlobalConfig(): LoyaltyGlobalConfig {
  try {
    const raw = localStorage.getItem(KEYS.global);
    return raw ? { ...DEFAULT_GLOBAL, ...JSON.parse(raw) } : { ...DEFAULT_GLOBAL };
  } catch { return { ...DEFAULT_GLOBAL }; }
}

export function updateGlobalConfig(data: Partial<LoyaltyGlobalConfig>): LoyaltyGlobalConfig {
  const current = getGlobalConfig();
  const updated = { ...current, ...data };
  localStorage.setItem(KEYS.global, JSON.stringify(updated));
  return updated;
}

// ─── Store Config ────────────────────────────────

function defaultStoreConfig(storeId: string): LoyaltyStoreConfig {
  const g = getGlobalConfig();
  return {
    storeId,
    enabled: false,
    programName: "Programa de Fidelidade",
    programDescription: "Acumule pontos e cashback a cada compra!",
    pointsEnabled: true,
    pointsPerReal: 5,
    pointsRedemptionRate: 10, // 100pts = R$10
    minOrderForPoints: 0,
    maxPointsPerOrder: 500,
    pointsExpirationDays: g.defaultExpirationDays,
    cashbackEnabled: true,
    cashbackPercent: 3,
    minOrderForCashback: 0,
    maxCashbackPerOrder: g.maxCashbackPerOrder,
    cashbackExpirationDays: g.defaultExpirationDays,
    minPointsToRedeem: 50,
    maxDiscountPercentPerOrder: g.maxDiscountPercentPerOrder,
    allowCombinePointsAndCashback: true,
    allowCombineWithCoupon: g.allowCombineWithCoupon,
    releaseOn: g.releaseOn,
  };
}

export function getStoreConfig(storeId: string): LoyaltyStoreConfig {
  const configs = getList<LoyaltyStoreConfig>(KEYS.configs);
  return configs.find((c) => c.storeId === storeId) || defaultStoreConfig(storeId);
}

export function getAllStoreConfigs(): LoyaltyStoreConfig[] {
  return getList<LoyaltyStoreConfig>(KEYS.configs);
}

export function updateStoreConfig(storeId: string, data: Partial<LoyaltyStoreConfig>): LoyaltyStoreConfig {
  const configs = getList<LoyaltyStoreConfig>(KEYS.configs);
  const idx = configs.findIndex((c) => c.storeId === storeId);
  const current = idx !== -1 ? configs[idx] : defaultStoreConfig(storeId);
  const g = getGlobalConfig();

  const updated: LoyaltyStoreConfig = {
    ...current,
    ...data,
    storeId,
    // enforce global limits
    pointsPerReal: Math.min(data.pointsPerReal ?? current.pointsPerReal, g.maxPointsPerReal),
    cashbackPercent: Math.min(data.cashbackPercent ?? current.cashbackPercent, g.maxCashbackPercent),
    maxCashbackPerOrder: Math.min(data.maxCashbackPerOrder ?? current.maxCashbackPerOrder, g.maxCashbackPerOrder),
    maxDiscountPercentPerOrder: Math.min(data.maxDiscountPercentPerOrder ?? current.maxDiscountPercentPerOrder, g.maxDiscountPercentPerOrder),
  };

  if (idx !== -1) { configs[idx] = updated; } else { configs.push(updated); }
  setList(KEYS.configs, configs);
  return updated;
}

// ─── Wallets ─────────────────────────────────────

export function getWallet(storeId: string, customerId: string): LoyaltyWallet | undefined {
  const clean = customerId.replace(/\D/g, "");
  return getList<LoyaltyWallet>(KEYS.wallets).find(
    (w) => w.storeId === storeId && w.customerId.replace(/\D/g, "") === clean
  );
}

export function getOrCreateWallet(storeId: string, customerId: string, customerName: string): LoyaltyWallet {
  const existing = getWallet(storeId, customerId);
  if (existing) return existing;
  const wallets = getList<LoyaltyWallet>(KEYS.wallets);
  const wallet: LoyaltyWallet = {
    id: genId(),
    storeId,
    customerId: customerId.replace(/\D/g, ""),
    customerName,
    pointsBalance: 0,
    pointsPending: 0,
    cashbackBalance: 0,
    cashbackPending: 0,
    totalPointsEarned: 0,
    totalPointsRedeemed: 0,
    totalPointsExpired: 0,
    totalCashbackEarned: 0,
    totalCashbackUsed: 0,
    totalCashbackExpired: 0,
    lastMovementAt: new Date().toISOString(),
  };
  wallets.push(wallet);
  setList(KEYS.wallets, wallets);
  return wallet;
}

export function getWalletsByStore(storeId: string): LoyaltyWallet[] {
  return getList<LoyaltyWallet>(KEYS.wallets).filter((w) => w.storeId === storeId);
}

export function getWalletsByCustomer(customerId: string): LoyaltyWallet[] {
  const clean = customerId.replace(/\D/g, "");
  return getList<LoyaltyWallet>(KEYS.wallets).filter(
    (w) => w.customerId.replace(/\D/g, "") === clean
  );
}

export function getAllWallets(): LoyaltyWallet[] {
  return getList<LoyaltyWallet>(KEYS.wallets);
}

function saveWallet(wallet: LoyaltyWallet) {
  const wallets = getList<LoyaltyWallet>(KEYS.wallets);
  const idx = wallets.findIndex((w) => w.id === wallet.id);
  if (idx !== -1) wallets[idx] = wallet; else wallets.push(wallet);
  setList(KEYS.wallets, wallets);
}

// ─── Movements ───────────────────────────────────

function addMovement(m: Omit<LoyaltyMovement, "id" | "createdAt">): LoyaltyMovement {
  const movements = getList<LoyaltyMovement>(KEYS.movements);
  const mov: LoyaltyMovement = { ...m, id: genId(), createdAt: new Date().toISOString() };
  movements.push(mov);
  setList(KEYS.movements, movements);
  return mov;
}

export function getMovements(walletId: string): LoyaltyMovement[] {
  return getList<LoyaltyMovement>(KEYS.movements)
    .filter((m) => m.walletId === walletId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getMovementsByStore(storeId: string): LoyaltyMovement[] {
  return getList<LoyaltyMovement>(KEYS.movements)
    .filter((m) => m.storeId === storeId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getMovementsByOrder(orderId: string): LoyaltyMovement[] {
  return getList<LoyaltyMovement>(KEYS.movements).filter((m) => m.orderId === orderId);
}

export function getAllMovements(): LoyaltyMovement[] {
  return getList<LoyaltyMovement>(KEYS.movements);
}

// ─── Campaigns ───────────────────────────────────

export function getCampaigns(storeId: string): LoyaltyCampaign[] {
  return getList<LoyaltyCampaign>(KEYS.campaigns).filter((c) => c.storeId === storeId);
}

export function getActiveCampaign(storeId: string): LoyaltyCampaign | undefined {
  const now = new Date();
  return getCampaigns(storeId).find(
    (c) => c.active && new Date(c.startDate) <= now && new Date(c.endDate) >= now
  );
}

export function addCampaign(campaign: Omit<LoyaltyCampaign, "id">): LoyaltyCampaign {
  const all = getList<LoyaltyCampaign>(KEYS.campaigns);
  const c: LoyaltyCampaign = { ...campaign, id: genId() };
  all.push(c);
  setList(KEYS.campaigns, all);
  return c;
}

export function updateCampaign(id: string, data: Partial<LoyaltyCampaign>): LoyaltyCampaign | undefined {
  const all = getList<LoyaltyCampaign>(KEYS.campaigns);
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...data, id };
  setList(KEYS.campaigns, all);
  return all[idx];
}

export function deleteCampaign(id: string) {
  const all = getList<LoyaltyCampaign>(KEYS.campaigns);
  setList(KEYS.campaigns, all.filter((c) => c.id !== id));
}

// ─── Calculation Engine ──────────────────────────

export function calculateEarnings(storeId: string, orderTotal: number): { points: number; cashback: number } {
  const global = getGlobalConfig();
  if (!global.enabled) return { points: 0, cashback: 0 };

  const config = getStoreConfig(storeId);
  if (!config.enabled) return { points: 0, cashback: 0 };

  let points = 0;
  let cashback = 0;

  // Points
  if (global.pointsEnabled && config.pointsEnabled && orderTotal >= config.minOrderForPoints) {
    points = Math.floor(orderTotal * config.pointsPerReal);
    if (config.maxPointsPerOrder > 0) points = Math.min(points, config.maxPointsPerOrder);
    // Apply campaign multiplier
    const campaign = getActiveCampaign(storeId);
    if (campaign?.type === "points_multiplier" && campaign.multiplier && orderTotal >= campaign.minOrder) {
      points = Math.floor(points * campaign.multiplier);
    }
  }

  // Cashback
  if (global.cashbackEnabled && config.cashbackEnabled && orderTotal >= config.minOrderForCashback) {
    let percent = config.cashbackPercent;
    const campaign = getActiveCampaign(storeId);
    if (campaign?.type === "cashback_bonus" && campaign.bonusPercent && orderTotal >= campaign.minOrder) {
      percent += campaign.bonusPercent;
    }
    percent = Math.min(percent, global.maxCashbackPercent);
    cashback = Math.round((orderTotal * percent) / 100 * 100) / 100;
    if (config.maxCashbackPerOrder > 0) cashback = Math.min(cashback, config.maxCashbackPerOrder);
  }

  return { points, cashback };
}

export function creditPending(
  storeId: string,
  customerId: string,
  customerName: string,
  orderId: string,
  orderTotal: number
): { points: number; cashback: number } {
  const { points, cashback } = calculateEarnings(storeId, orderTotal);
  if (points === 0 && cashback === 0) return { points: 0, cashback: 0 };

  const wallet = getOrCreateWallet(storeId, customerId, customerName);

  if (points > 0) {
    wallet.pointsPending += points;
    wallet.lastMovementAt = new Date().toISOString();
    addMovement({
      storeId,
      walletId: wallet.id,
      customerId: wallet.customerId,
      type: "points",
      action: "credit_pending",
      amount: points,
      balanceAfter: wallet.pointsBalance,
      orderId,
      performedBy: "system",
    });
  }

  if (cashback > 0) {
    wallet.cashbackPending += Math.round(cashback * 100) / 100;
    wallet.lastMovementAt = new Date().toISOString();
    addMovement({
      storeId,
      walletId: wallet.id,
      customerId: wallet.customerId,
      type: "cashback",
      action: "credit_pending",
      amount: cashback,
      balanceAfter: wallet.cashbackBalance,
      orderId,
      performedBy: "system",
    });
  }

  saveWallet(wallet);
  return { points, cashback };
}

export function releasePending(orderId: string) {
  const movements = getMovementsByOrder(orderId).filter((m) => m.action === "credit_pending");
  if (movements.length === 0) return;

  for (const mov of movements) {
    const wallets = getList<LoyaltyWallet>(KEYS.wallets);
    const wallet = wallets.find((w) => w.id === mov.walletId);
    if (!wallet) continue;

    if (mov.type === "points") {
      wallet.pointsPending = Math.max(0, wallet.pointsPending - mov.amount);
      wallet.pointsBalance += mov.amount;
      wallet.totalPointsEarned += mov.amount;
    } else {
      wallet.cashbackPending = Math.max(0, Math.round((wallet.cashbackPending - mov.amount) * 100) / 100);
      wallet.cashbackBalance = Math.round((wallet.cashbackBalance + mov.amount) * 100) / 100;
      wallet.totalCashbackEarned = Math.round((wallet.totalCashbackEarned + mov.amount) * 100) / 100;
    }
    wallet.lastMovementAt = new Date().toISOString();
    saveWallet(wallet);

    addMovement({
      storeId: mov.storeId,
      walletId: mov.walletId,
      customerId: mov.customerId,
      type: mov.type,
      action: "credit_released",
      amount: mov.amount,
      balanceAfter: mov.type === "points" ? wallet.pointsBalance : wallet.cashbackBalance,
      orderId,
      performedBy: "system",
    });
  }
}

export function redeemPoints(walletId: string, points: number, orderId?: string): number {
  const wallets = getList<LoyaltyWallet>(KEYS.wallets);
  const wallet = wallets.find((w) => w.id === walletId);
  if (!wallet || points <= 0 || wallet.pointsBalance < points) return 0;

  const config = getStoreConfig(wallet.storeId);
  const discount = Math.round((points / config.pointsRedemptionRate) * 100) / 100;

  wallet.pointsBalance -= points;
  wallet.totalPointsRedeemed += points;
  wallet.lastMovementAt = new Date().toISOString();
  saveWallet(wallet);

  addMovement({
    storeId: wallet.storeId,
    walletId: wallet.id,
    customerId: wallet.customerId,
    type: "points",
    action: "debit_redeem",
    amount: points,
    balanceAfter: wallet.pointsBalance,
    orderId,
    performedBy: "system",
  });

  return discount;
}

export function redeemCashback(walletId: string, amount: number, orderId?: string): number {
  const wallets = getList<LoyaltyWallet>(KEYS.wallets);
  const wallet = wallets.find((w) => w.id === walletId);
  if (!wallet || amount <= 0 || wallet.cashbackBalance < amount) return 0;

  const used = Math.min(amount, wallet.cashbackBalance);
  wallet.cashbackBalance = Math.round((wallet.cashbackBalance - used) * 100) / 100;
  wallet.totalCashbackUsed = Math.round((wallet.totalCashbackUsed + used) * 100) / 100;
  wallet.lastMovementAt = new Date().toISOString();
  saveWallet(wallet);

  addMovement({
    storeId: wallet.storeId,
    walletId: wallet.id,
    customerId: wallet.customerId,
    type: "cashback",
    action: "debit_redeem",
    amount: used,
    balanceAfter: wallet.cashbackBalance,
    orderId,
    performedBy: "system",
  });

  return used;
}

export function reverseBenefits(orderId: string) {
  const movements = getMovementsByOrder(orderId).filter(
    (m) => m.action === "credit_released" || m.action === "credit_pending"
  );

  for (const mov of movements) {
    const wallets = getList<LoyaltyWallet>(KEYS.wallets);
    const wallet = wallets.find((w) => w.id === mov.walletId);
    if (!wallet) continue;

    if (mov.action === "credit_released") {
      if (mov.type === "points") {
        wallet.pointsBalance = Math.max(0, wallet.pointsBalance - mov.amount);
        wallet.totalPointsEarned = Math.max(0, wallet.totalPointsEarned - mov.amount);
      } else {
        wallet.cashbackBalance = Math.max(0, Math.round((wallet.cashbackBalance - mov.amount) * 100) / 100);
        wallet.totalCashbackEarned = Math.max(0, Math.round((wallet.totalCashbackEarned - mov.amount) * 100) / 100);
      }
    } else if (mov.action === "credit_pending") {
      if (mov.type === "points") {
        wallet.pointsPending = Math.max(0, wallet.pointsPending - mov.amount);
      } else {
        wallet.cashbackPending = Math.max(0, Math.round((wallet.cashbackPending - mov.amount) * 100) / 100);
      }
    }

    wallet.lastMovementAt = new Date().toISOString();
    saveWallet(wallet);

    addMovement({
      storeId: mov.storeId,
      walletId: mov.walletId,
      customerId: mov.customerId,
      type: mov.type,
      action: "debit_reversal",
      amount: mov.amount,
      balanceAfter: mov.type === "points" ? wallet.pointsBalance : wallet.cashbackBalance,
      orderId,
      reason: "Pedido cancelado",
      performedBy: "system",
    });
  }
}

export function manualAdjust(
  walletId: string,
  type: "points" | "cashback",
  isCredit: boolean,
  amount: number,
  reason: string,
  performedBy: string
) {
  const wallets = getList<LoyaltyWallet>(KEYS.wallets);
  const wallet = wallets.find((w) => w.id === walletId);
  if (!wallet || amount <= 0) return;

  if (type === "points") {
    if (isCredit) {
      wallet.pointsBalance += amount;
      wallet.totalPointsEarned += amount;
    } else {
      wallet.pointsBalance = Math.max(0, wallet.pointsBalance - amount);
    }
  } else {
    if (isCredit) {
      wallet.cashbackBalance = Math.round((wallet.cashbackBalance + amount) * 100) / 100;
      wallet.totalCashbackEarned = Math.round((wallet.totalCashbackEarned + amount) * 100) / 100;
    } else {
      wallet.cashbackBalance = Math.max(0, Math.round((wallet.cashbackBalance - amount) * 100) / 100);
    }
  }

  wallet.lastMovementAt = new Date().toISOString();
  saveWallet(wallet);

  addMovement({
    storeId: wallet.storeId,
    walletId: wallet.id,
    customerId: wallet.customerId,
    type,
    action: isCredit ? "manual_credit" : "manual_debit",
    amount,
    balanceAfter: type === "points" ? wallet.pointsBalance : wallet.cashbackBalance,
    reason,
    performedBy,
  });
}

// ─── Points-to-money conversion helper ───────────

export function pointsToMoney(storeId: string, points: number): number {
  const config = getStoreConfig(storeId);
  return Math.round((points / config.pointsRedemptionRate) * 100) / 100;
}
