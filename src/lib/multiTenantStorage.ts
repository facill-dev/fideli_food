// Multi-tenant localStorage data layer

export interface StoreConfig {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  niche: string;
  description: string;
  logo: string;
  primaryColor: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  instagram: string;
  rating: number;
  createdAt: string;
}

export interface TenantUser {
  id: string;
  email: string;
  password: string; // plain text for localStorage demo only
  name: string;
  storeId?: string;
  createdAt: string;
}

export interface TenantProduct {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  image: string;
  category: string;
  available: boolean;
  availableQty: number;
  badge?: string;
  delivery: boolean;
  pickup: boolean;
  rating?: number;
  prepTime?: string;
}

export interface TenantCategory {
  id: string;
  storeId: string;
  name: string;
  image: string;
  slug: string;
}

export interface TenantOrder {
  id: string;
  storeId: string;
  customerName: string;
  customerPhone: string;
  items: { productId: string; name: string; qty: number; price: number }[];
  total: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
  createdAt: string;
}

const KEYS = {
  users: "mt_users",
  stores: "mt_stores",
  products: "mt_products",
  categories: "mt_categories",
  orders: "mt_orders",
  currentUser: "mt_current_user",
};

function getList<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function setList<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Auth ────────────────────────────────────────

export function signup(email: string, password: string, name: string): TenantUser {
  const users = getList<TenantUser>(KEYS.users);
  if (users.find((u) => u.email === email)) {
    throw new Error("Email já cadastrado");
  }
  const user: TenantUser = {
    id: genId(),
    email,
    password,
    name,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  setList(KEYS.users, users);
  localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
  return user;
}

export function login(email: string, password: string): TenantUser {
  const users = getList<TenantUser>(KEYS.users);
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) throw new Error("Email ou senha incorretos");
  localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem(KEYS.currentUser);
}

export function getCurrentUser(): TenantUser | null {
  try {
    const raw = localStorage.getItem(KEYS.currentUser);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Stores ──────────────────────────────────────

export function createStore(
  ownerId: string,
  data: Omit<StoreConfig, "id" | "ownerId" | "createdAt" | "rating">
): StoreConfig {
  const stores = getList<StoreConfig>(KEYS.stores);
  let slug = slugify(data.name);
  // ensure unique slug
  let suffix = 0;
  while (stores.find((s) => s.slug === slug)) {
    suffix++;
    slug = slugify(data.name) + "-" + suffix;
  }
  const store: StoreConfig = {
    ...data,
    id: genId(),
    ownerId,
    slug,
    rating: 5.0,
    createdAt: new Date().toISOString(),
  };
  stores.push(store);
  setList(KEYS.stores, stores);

  // link user to store
  const users = getList<TenantUser>(KEYS.users);
  const idx = users.findIndex((u) => u.id === ownerId);
  if (idx !== -1) {
    users[idx].storeId = store.id;
    setList(KEYS.users, users);
    localStorage.setItem(KEYS.currentUser, JSON.stringify(users[idx]));
  }
  return store;
}

export function getStoreBySlug(slug: string): StoreConfig | undefined {
  return getList<StoreConfig>(KEYS.stores).find((s) => s.slug === slug);
}

export function getStoreById(id: string): StoreConfig | undefined {
  return getList<StoreConfig>(KEYS.stores).find((s) => s.id === id);
}

export function getUserStore(userId: string): StoreConfig | undefined {
  return getList<StoreConfig>(KEYS.stores).find((s) => s.ownerId === userId);
}

export function updateStore(storeId: string, data: Partial<StoreConfig>): StoreConfig | undefined {
  const stores = getList<StoreConfig>(KEYS.stores);
  const idx = stores.findIndex((s) => s.id === storeId);
  if (idx === -1) return undefined;
  stores[idx] = { ...stores[idx], ...data, id: storeId };
  setList(KEYS.stores, stores);
  return stores[idx];
}

// ─── Products ────────────────────────────────────

export function getProductsByStore(storeId: string): TenantProduct[] {
  return getList<TenantProduct>(KEYS.products).filter((p) => p.storeId === storeId);
}

export function addProduct(product: Omit<TenantProduct, "id">): TenantProduct {
  const products = getList<TenantProduct>(KEYS.products);
  const newProduct: TenantProduct = { ...product, id: genId() };
  products.push(newProduct);
  setList(KEYS.products, products);
  return newProduct;
}

export function updateProduct(productId: string, data: Partial<TenantProduct>): TenantProduct | undefined {
  const products = getList<TenantProduct>(KEYS.products);
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) return undefined;
  products[idx] = { ...products[idx], ...data, id: productId };
  setList(KEYS.products, products);
  return products[idx];
}

export function deleteProduct(productId: string) {
  const products = getList<TenantProduct>(KEYS.products);
  setList(KEYS.products, products.filter((p) => p.id !== productId));
}

// ─── Categories ──────────────────────────────────

export function getCategoriesByStore(storeId: string): TenantCategory[] {
  return getList<TenantCategory>(KEYS.categories).filter((c) => c.storeId === storeId);
}

export function addCategory(cat: Omit<TenantCategory, "id">): TenantCategory {
  const categories = getList<TenantCategory>(KEYS.categories);
  const newCat: TenantCategory = { ...cat, id: genId() };
  categories.push(newCat);
  setList(KEYS.categories, categories);
  return newCat;
}

// ─── Orders ──────────────────────────────────────

export function getOrdersByStore(storeId: string): TenantOrder[] {
  return getList<TenantOrder>(KEYS.orders).filter((o) => o.storeId === storeId);
}

export function createOrder(order: Omit<TenantOrder, "id" | "createdAt">): TenantOrder {
  const orders = getList<TenantOrder>(KEYS.orders);
  const newOrder: TenantOrder = { ...order, id: genId(), createdAt: new Date().toISOString() };
  orders.push(newOrder);
  setList(KEYS.orders, orders);
  return newOrder;
}

export function updateOrderStatus(orderId: string, status: TenantOrder["status"]) {
  const orders = getList<TenantOrder>(KEYS.orders);
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = status;
    setList(KEYS.orders, orders);
  }
}

// ─── Notifications ───────────────────────────────

export interface TenantNotification {
  id: string;
  storeId: string;
  type: "new_order" | "status_change";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  orderId?: string;
}

const NOTIF_KEY = "mt_notifications";

export function getNotificationsByStore(storeId: string): TenantNotification[] {
  return getList<TenantNotification>(NOTIF_KEY)
    .filter((n) => n.storeId === storeId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addNotification(
  notification: Omit<TenantNotification, "id" | "createdAt">
): TenantNotification {
  const all = getList<TenantNotification>(NOTIF_KEY);
  const newNotif: TenantNotification = {
    ...notification,
    id: genId(),
    createdAt: new Date().toISOString(),
  };
  all.push(newNotif);
  setList(NOTIF_KEY, all);
  return newNotif;
}

export function markNotificationRead(notificationId: string) {
  const all = getList<TenantNotification>(NOTIF_KEY);
  const idx = all.findIndex((n) => n.id === notificationId);
  if (idx !== -1) {
    all[idx].read = true;
    setList(NOTIF_KEY, all);
  }
}

export function markAllNotificationsRead(storeId: string) {
  const all = getList<TenantNotification>(NOTIF_KEY);
  all.forEach((n) => { if (n.storeId === storeId) n.read = true; });
  setList(NOTIF_KEY, all);
}

export function getUnreadNotificationCount(storeId: string): number {
  return getList<TenantNotification>(NOTIF_KEY).filter(
    (n) => n.storeId === storeId && !n.read
  ).length;
}

// ─── Orders (extra) ──────────────────────────────

export function getOrderById(orderId: string): TenantOrder | undefined {
  return getList<TenantOrder>(KEYS.orders).find((o) => o.id === orderId);
}

// ─── Nichos ──────────────────────────────────────

export const NICHES = [
  { id: "confeitaria", label: "Confeitaria", icon: "Cake" },
  { id: "hamburgueria", label: "Hamburgueria", icon: "Beef" },
  { id: "pizzaria", label: "Pizzaria", icon: "Pizza" },
  { id: "restaurante", label: "Restaurante", icon: "UtensilsCrossed" },
  { id: "cafeteria", label: "Cafeteria", icon: "Coffee" },
  { id: "sorveteria", label: "Sorveteria", icon: "IceCreamCone" },
  { id: "padaria", label: "Padaria", icon: "Croissant" },
  { id: "acai", label: "Açaí & Sucos", icon: "Cherry" },
  { id: "japonesa", label: "Culinária Japonesa", icon: "Fish" },
  { id: "outro", label: "Outro", icon: "Store" },
];

// ─── All Stores (for landing/discovery) ──────────

export function getAllStores(): StoreConfig[] {
  return getList<StoreConfig>(KEYS.stores);
}

// ─── Super Admin helpers ─────────────────────────

const SUPER_ADMIN_EMAIL = "admin@sistema.com";

export function isSuperAdmin(user: TenantUser | null): boolean {
  return !!user && user.email === SUPER_ADMIN_EMAIL;
}

export function getAllUsers(): TenantUser[] {
  return getList<TenantUser>(KEYS.users);
}

export function getAllOrders(): TenantOrder[] {
  return getList<TenantOrder>(KEYS.orders);
}

export function getAllProducts(): TenantProduct[] {
  return getList<TenantProduct>(KEYS.products);
}

export function getAllCategories(): TenantCategory[] {
  return getList<TenantCategory>(KEYS.categories);
}

export function deleteUser(userId: string) {
  const users = getList<TenantUser>(KEYS.users);
  setList(KEYS.users, users.filter((u) => u.id !== userId));
  // also remove their store, products, categories, orders
  const stores = getList<StoreConfig>(KEYS.stores);
  const userStore = stores.find((s) => s.ownerId === userId);
  if (userStore) {
    setList(KEYS.stores, stores.filter((s) => s.id !== userStore.id));
    const products = getList<TenantProduct>(KEYS.products);
    setList(KEYS.products, products.filter((p) => p.storeId !== userStore.id));
    const categories = getList<TenantCategory>(KEYS.categories);
    setList(KEYS.categories, categories.filter((c) => c.storeId !== userStore.id));
    const orders = getList<TenantOrder>(KEYS.orders);
    setList(KEYS.orders, orders.filter((o) => o.storeId !== userStore.id));
  }
}

export function deleteStore(storeId: string) {
  const stores = getList<StoreConfig>(KEYS.stores);
  setList(KEYS.stores, stores.filter((s) => s.id !== storeId));
  // unlink user
  const users = getList<TenantUser>(KEYS.users);
  const owner = users.find((u) => u.storeId === storeId);
  if (owner) {
    owner.storeId = undefined;
    setList(KEYS.users, users);
  }
  // clean up products, categories, orders
  setList(KEYS.products, getList<TenantProduct>(KEYS.products).filter((p) => p.storeId !== storeId));
  setList(KEYS.categories, getList<TenantCategory>(KEYS.categories).filter((c) => c.storeId !== storeId));
  setList(KEYS.orders, getList<TenantOrder>(KEYS.orders).filter((o) => o.storeId !== storeId));
}
