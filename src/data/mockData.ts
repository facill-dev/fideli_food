import productBolo from "@/assets/product-bolo.jpg";
import productTorta from "@/assets/product-torta.jpg";
import productFatia from "@/assets/product-fatia.jpg";
import productSobremesa from "@/assets/product-sobremesa.jpg";

export interface Product {
  id: string;
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
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export const categories: Category[] = [
  { id: "1", name: "Bolos Inteiros", icon: "🎂", slug: "bolos" },
  { id: "2", name: "Tortas", icon: "🥧", slug: "tortas" },
  { id: "3", name: "Fatias", icon: "🍰", slug: "fatias" },
  { id: "4", name: "Sobremesas", icon: "🍫", slug: "sobremesas" },
  { id: "5", name: "Combos", icon: "🎁", slug: "combos" },
  { id: "6", name: "Especiais", icon: "⭐", slug: "especiais" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Bolo de Chocolate Belga",
    description: "Camadas de chocolate belga com recheio de ganache e morangos frescos. Serve até 15 pessoas.",
    price: 120,
    image: productBolo,
    category: "bolos",
    available: true,
    availableQty: 5,
    badge: "Mais Vendido",
    delivery: true,
    pickup: true,
  },
  {
    id: "2",
    name: "Torta de Frutas Vermelhas",
    description: "Torta artesanal com creme pâtissière e mix de frutas vermelhas frescas.",
    price: 95,
    image: productTorta,
    category: "tortas",
    available: true,
    availableQty: 8,
    delivery: true,
    pickup: true,
  },
  {
    id: "3",
    name: "Fatia Chocolate Intenso",
    description: "Fatia generosa do nosso bolo de chocolate com 3 camadas de recheio.",
    price: 18,
    promoPrice: 14,
    image: productFatia,
    category: "fatias",
    available: true,
    availableQty: 30,
    badge: "Promoção",
    delivery: false,
    pickup: true,
  },
  {
    id: "4",
    name: "Brigadeiro Gourmet",
    description: "Brigadeiro artesanal com chocolate 70% cacau, finalizado com nibs.",
    price: 8,
    image: productSobremesa,
    category: "sobremesas",
    available: true,
    availableQty: 50,
    delivery: true,
    pickup: true,
  },
  {
    id: "5",
    name: "Bolo Red Velvet",
    description: "Clássico bolo red velvet com cream cheese frosting. Serve até 12 pessoas.",
    price: 110,
    image: productBolo,
    category: "bolos",
    available: true,
    availableQty: 3,
    delivery: true,
    pickup: true,
  },
  {
    id: "6",
    name: "Fatia Caramelo Salgado",
    description: "Fatia com camadas de caramelo salgado, biscoito e chocolate ao leite.",
    price: 16,
    image: productFatia,
    category: "fatias",
    available: true,
    availableQty: 25,
    delivery: false,
    pickup: true,
  },
  {
    id: "7",
    name: "Combo Festival (3 Fatias)",
    description: "Escolha 3 fatias do cardápio com desconto especial.",
    price: 48,
    promoPrice: 39,
    image: productFatia,
    category: "combos",
    available: true,
    availableQty: 15,
    badge: "Oferta",
    delivery: false,
    pickup: true,
  },
  {
    id: "8",
    name: "Torta Limão Siciliano",
    description: "Torta de limão siciliano com merengue maçaricado. Refrescante e delicada.",
    price: 85,
    image: productTorta,
    category: "tortas",
    available: true,
    availableQty: 4,
    delivery: true,
    pickup: true,
  },
];
