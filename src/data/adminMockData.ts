export interface Order {
  id: string;
  number: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: { productName: string; quantity: number; unitPrice: number }[];
  total: number;
  status: "criado" | "aguardando_pagamento" | "pago" | "confirmado" | "em_preparacao" | "pronto" | "retirado" | "entregue" | "cancelado" | "expirado";
  paymentStatus: "pendente" | "pago" | "falhou" | "estornado" | "expirado";
  paymentMethod: "pix" | "cartao";
  type: "retirada" | "entrega";
  eventId?: string;
  eventName?: string;
  pickupDate?: string;
  pickupTime?: string;
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpf?: string;
  totalOrders: number;
  totalSpent: number;
  averageTicket: number;
  firstOrderDate: string;
  lastOrderDate: string;
  addresses: string[];
}

export interface DashboardMetrics {
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  ordersToday: number;
  ordersWeek: number;
  ordersMonth: number;
  customersTotal: number;
  customersNew: number;
  averageTicket: number;
  pendingPayment: number;
  confirmed: number;
  inProduction: number;
  ready: number;
  delivered: number;
  pickedUp: number;
  cancelled: number;
  activeEvents: number;
  soldOutProducts: number;
}

export const dashboardMetrics: DashboardMetrics = {
  revenueToday: 2340,
  revenueWeek: 12850,
  revenueMonth: 48720,
  ordersToday: 18,
  ordersWeek: 94,
  ordersMonth: 387,
  customersTotal: 256,
  customersNew: 23,
  averageTicket: 126,
  pendingPayment: 4,
  confirmed: 7,
  inProduction: 3,
  ready: 2,
  delivered: 5,
  pickedUp: 12,
  cancelled: 1,
  activeEvents: 2,
  soldOutProducts: 3,
};

export const revenueByDay = [
  { day: "Seg", revenue: 1200, orders: 8 },
  { day: "Ter", revenue: 980, orders: 6 },
  { day: "Qua", revenue: 1450, orders: 11 },
  { day: "Qui", revenue: 1100, orders: 9 },
  { day: "Sex", revenue: 2100, orders: 16 },
  { day: "Sab", revenue: 3800, orders: 32 },
  { day: "Dom", revenue: 2220, orders: 12 },
];

export const ordersByHour = [
  { hour: "08h", orders: 2 },
  { hour: "09h", orders: 5 },
  { hour: "10h", orders: 8 },
  { hour: "11h", orders: 12 },
  { hour: "12h", orders: 6 },
  { hour: "13h", orders: 4 },
  { hour: "14h", orders: 9 },
  { hour: "15h", orders: 14 },
  { hour: "16h", orders: 11 },
  { hour: "17h", orders: 7 },
  { hour: "18h", orders: 3 },
];

export const topProducts = [
  { name: "Bolo de Chocolate Belga", sold: 45, revenue: 5400 },
  { name: "Torta de Frutas Vermelhas", sold: 38, revenue: 3610 },
  { name: "Fatia Chocolate Intenso", sold: 120, revenue: 1680 },
  { name: "Brigadeiro Gourmet", sold: 200, revenue: 1600 },
  { name: "Bolo Red Velvet", sold: 28, revenue: 3080 },
];

export const salesByCategory = [
  { category: "Bolos", value: 8480, percentage: 35 },
  { category: "Tortas", value: 5320, percentage: 22 },
  { category: "Fatias", value: 4200, percentage: 17 },
  { category: "Sobremesas", value: 3100, percentage: 13 },
  { category: "Combos", value: 2100, percentage: 9 },
  { category: "Especiais", value: 960, percentage: 4 },
];

export const ordersByType = [
  { type: "Retirada", value: 65, percentage: 69 },
  { type: "Entrega", value: 29, percentage: 31 },
];

export const orders: Order[] = [
  {
    id: "1", number: "#1247", customerName: "Maria Silva", customerPhone: "(11) 99876-5432", customerEmail: "maria@email.com",
    items: [{ productName: "Bolo de Chocolate Belga", quantity: 1, unitPrice: 120 }],
    total: 120, status: "em_preparacao", paymentStatus: "pago", paymentMethod: "pix", type: "retirada",
    pickupDate: "2026-03-08", pickupTime: "14:00", createdAt: "2026-03-08T10:30:00", updatedAt: "2026-03-08T10:45:00",
  },
  {
    id: "2", number: "#1246", customerName: "Joao Santos", customerPhone: "(11) 98765-4321", customerEmail: "joao@email.com",
    items: [{ productName: "Torta de Frutas Vermelhas", quantity: 1, unitPrice: 95 }, { productName: "Brigadeiro Gourmet", quantity: 6, unitPrice: 8 }],
    total: 143, status: "confirmado", paymentStatus: "pago", paymentMethod: "pix", type: "entrega",
    deliveryAddress: "Rua das Flores, 123 - Vila Mariana", createdAt: "2026-03-08T09:15:00", updatedAt: "2026-03-08T09:20:00",
  },
  {
    id: "3", number: "#1245", customerName: "Ana Oliveira", customerPhone: "(11) 97654-3210", customerEmail: "ana@email.com",
    items: [{ productName: "Combo Festival (3 Fatias)", quantity: 2, unitPrice: 39 }],
    total: 78, status: "pronto", paymentStatus: "pago", paymentMethod: "pix", type: "retirada",
    eventId: "1", eventName: "Festival das Fatias", pickupDate: "2026-03-08", pickupTime: "15:00",
    createdAt: "2026-03-07T18:00:00", updatedAt: "2026-03-08T13:30:00",
  },
  {
    id: "4", number: "#1244", customerName: "Carlos Pereira", customerPhone: "(11) 96543-2109", customerEmail: "carlos@email.com",
    items: [{ productName: "Bolo Red Velvet", quantity: 1, unitPrice: 110 }],
    total: 110, status: "aguardando_pagamento", paymentStatus: "pendente", paymentMethod: "pix", type: "retirada",
    pickupDate: "2026-03-09", pickupTime: "10:00", createdAt: "2026-03-08T11:00:00", updatedAt: "2026-03-08T11:00:00",
  },
  {
    id: "5", number: "#1243", customerName: "Fernanda Lima", customerPhone: "(11) 95432-1098", customerEmail: "fernanda@email.com",
    items: [{ productName: "Fatia Chocolate Intenso", quantity: 3, unitPrice: 14 }, { productName: "Fatia Caramelo Salgado", quantity: 2, unitPrice: 16 }],
    total: 74, status: "retirado", paymentStatus: "pago", paymentMethod: "pix", type: "retirada",
    pickupDate: "2026-03-07", pickupTime: "16:00", createdAt: "2026-03-07T08:00:00", updatedAt: "2026-03-07T16:10:00",
  },
  {
    id: "6", number: "#1242", customerName: "Roberto Costa", customerPhone: "(11) 94321-0987", customerEmail: "roberto@email.com",
    items: [{ productName: "Torta Limao Siciliano", quantity: 1, unitPrice: 85 }],
    total: 85, status: "entregue", paymentStatus: "pago", paymentMethod: "pix", type: "entrega",
    deliveryAddress: "Av. Paulista, 1000 - Bela Vista", createdAt: "2026-03-07T09:00:00", updatedAt: "2026-03-07T15:00:00",
  },
  {
    id: "7", number: "#1241", customerName: "Lucia Mendes", customerPhone: "(11) 93210-9876", customerEmail: "lucia@email.com",
    items: [{ productName: "Bolo de Chocolate Belga", quantity: 1, unitPrice: 120 }, { productName: "Brigadeiro Gourmet", quantity: 10, unitPrice: 8 }],
    total: 200, status: "cancelado", paymentStatus: "estornado", paymentMethod: "pix", type: "retirada",
    createdAt: "2026-03-06T14:00:00", updatedAt: "2026-03-06T16:00:00", notes: "Cliente cancelou por indisponibilidade de horario",
  },
  {
    id: "8", number: "#1240", customerName: "Pedro Alves", customerPhone: "(11) 92109-8765", customerEmail: "pedro@email.com",
    items: [{ productName: "Combo Festival (3 Fatias)", quantity: 1, unitPrice: 39 }],
    total: 39, status: "expirado", paymentStatus: "expirado", paymentMethod: "pix", type: "retirada",
    eventId: "1", eventName: "Festival das Fatias", createdAt: "2026-03-06T10:00:00", updatedAt: "2026-03-06T10:30:00",
  },
];

export const customers: Customer[] = [
  { id: "1", name: "Maria Silva", phone: "(11) 99876-5432", email: "maria@email.com", totalOrders: 12, totalSpent: 1580, averageTicket: 132, firstOrderDate: "2025-08-15", lastOrderDate: "2026-03-08", addresses: ["Rua Augusta, 500 - Consolacao"] },
  { id: "2", name: "Joao Santos", phone: "(11) 98765-4321", email: "joao@email.com", totalOrders: 8, totalSpent: 920, averageTicket: 115, firstOrderDate: "2025-10-02", lastOrderDate: "2026-03-08", addresses: ["Rua das Flores, 123 - Vila Mariana"] },
  { id: "3", name: "Ana Oliveira", phone: "(11) 97654-3210", email: "ana@email.com", totalOrders: 15, totalSpent: 2100, averageTicket: 140, firstOrderDate: "2025-06-20", lastOrderDate: "2026-03-07", addresses: ["Al. Santos, 800 - Jardins"] },
  { id: "4", name: "Carlos Pereira", phone: "(11) 96543-2109", email: "carlos@email.com", totalOrders: 3, totalSpent: 340, averageTicket: 113, firstOrderDate: "2026-01-10", lastOrderDate: "2026-03-08", addresses: ["Rua Vergueiro, 1200 - Liberdade"] },
  { id: "5", name: "Fernanda Lima", phone: "(11) 95432-1098", email: "fernanda@email.com", totalOrders: 22, totalSpent: 3200, averageTicket: 145, firstOrderDate: "2025-03-01", lastOrderDate: "2026-03-07", addresses: ["Rua Oscar Freire, 300 - Pinheiros", "Av. Reboucas, 600 - Pinheiros"] },
  { id: "6", name: "Roberto Costa", phone: "(11) 94321-0987", email: "roberto@email.com", totalOrders: 6, totalSpent: 780, averageTicket: 130, firstOrderDate: "2025-11-15", lastOrderDate: "2026-03-07", addresses: ["Av. Paulista, 1000 - Bela Vista"] },
  { id: "7", name: "Lucia Mendes", phone: "(11) 93210-9876", email: "lucia@email.com", totalOrders: 4, totalSpent: 520, averageTicket: 130, firstOrderDate: "2025-12-01", lastOrderDate: "2026-03-06", addresses: ["Rua Haddock Lobo, 400 - Cerqueira Cesar"] },
  { id: "8", name: "Pedro Alves", phone: "(11) 92109-8765", email: "pedro@email.com", totalOrders: 1, totalSpent: 39, averageTicket: 39, firstOrderDate: "2026-03-06", lastOrderDate: "2026-03-06", addresses: [] },
];

export const monthlyRevenue = [
  { month: "Out", revenue: 32000 },
  { month: "Nov", revenue: 38000 },
  { month: "Dez", revenue: 52000 },
  { month: "Jan", revenue: 41000 },
  { month: "Fev", revenue: 44000 },
  { month: "Mar", revenue: 48720 },
];
