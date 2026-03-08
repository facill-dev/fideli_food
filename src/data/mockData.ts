import catBolos from "@/assets/cat-bolos.png";
import catTortas from "@/assets/cat-tortas.png";
import catFatias from "@/assets/cat-fatias.png";
import catSobremesas from "@/assets/cat-sobremesas.png";
import catCombos from "@/assets/cat-combos.png";
import catEspeciais from "@/assets/cat-especiais.png";
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
  rating?: number;
  prepTime?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  slug: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export const categories: Category[] = [
  { id: "1", name: "Bolos", image: catBolos, slug: "bolos" },
  { id: "2", name: "Tortas", image: catTortas, slug: "tortas" },
  { id: "3", name: "Fatias", image: catFatias, slug: "fatias" },
  { id: "4", name: "Sobremesas", image: catSobremesas, slug: "sobremesas" },
  { id: "5", name: "Combos", image: catCombos, slug: "combos" },
  { id: "6", name: "Especiais", image: catEspeciais, slug: "especiais" },
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
    rating: 4.9,
    prepTime: "Sob encomenda",
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
    rating: 4.8,
    prepTime: "Pronta entrega",
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
    rating: 4.7,
    prepTime: "Pronta entrega",
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
    rating: 4.9,
    prepTime: "Pronta entrega",
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
    badge: "Poucas unidades",
    delivery: true,
    pickup: true,
    rating: 4.8,
    prepTime: "Sob encomenda",
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
    rating: 4.6,
    prepTime: "Pronta entrega",
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
    rating: 4.9,
    prepTime: "Pronta entrega",
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
    rating: 4.7,
    prepTime: "Pronta entrega",
  },
];
