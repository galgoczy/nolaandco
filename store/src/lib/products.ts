export interface ProductVariant {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: "parna" | "poszter";
  form: "origin" | "nova";
  style: "core" | "linea" | "atelier";
  dimensions: string;
  material?: string;
  features: string[];
  customizable: boolean;
  customFields: CustomField[];
}

export interface CustomField {
  name: string;
  label: string;
  type: "text" | "date" | "number" | "select";
  placeholder?: string;
  required: boolean;
  options?: string[];
}

const babyCustomFields: CustomField[] = [
  {
    name: "babyName",
    label: "Baba neve",
    type: "text",
    placeholder: "pl. Kis Emma",
    required: true,
  },
  {
    name: "birthDate",
    label: "Születési dátum",
    type: "date",
    required: true,
  },
  {
    name: "birthWeight",
    label: "Születési súly",
    type: "text",
    placeholder: "pl. 3250 g",
    required: true,
  },
  {
    name: "birthLength",
    label: "Születési hossz",
    type: "text",
    placeholder: "pl. 50 cm",
    required: true,
  },
];

export const products: ProductVariant[] = [
  {
    id: "origin-core",
    name: "ORIGIN Core",
    slug: "origin-core",
    description:
      "A magzati állapotot idéző, oldalt fekvő pozíció. Skandináv minimalizmus – letisztult, egyvonalas baba körvonal.",
    price: 14990,
    image: "/icons/Angyalbaba.png",
    category: "parna",
    form: "origin",
    style: "core",
    dimensions: "1:1 arány, ~45 cm",
    material: "OEKO-TEX® minősítésű pamut huzat és cérna, hipoallergén töltet",
    features: [
      "OEKO-TEX® tanúsított",
      "Hipoallergén töltet",
      "Mosógépben mosható",
      "Kézzel készült",
    ],
    customizable: true,
    customFields: babyCustomFields,
  },
  {
    id: "origin-linea",
    name: "ORIGIN Linea",
    slug: "origin-linea",
    description:
      "A magzati állapotot idéző, oldalt fekvő pozíció. Megszakítás nélküli vonalvezetés – folyamatos, áramló kontúr.",
    price: 16990,
    image: "/icons/Angyalbaba.png",
    category: "parna",
    form: "origin",
    style: "linea",
    dimensions: "1:1 arány, ~45 cm",
    material: "OEKO-TEX® minősítésű pamut huzat és cérna, hipoallergén töltet",
    features: [
      "OEKO-TEX® tanúsított",
      "Hipoallergén töltet",
      "Mosógépben mosható",
      "Kézzel készült",
    ],
    customizable: true,
    customFields: babyCustomFields,
  },
  {
    id: "origin-atelier",
    name: "ORIGIN Atelier",
    slug: "origin-atelier",
    description:
      "A magzati állapotot idéző, oldalt fekvő pozíció. Kézműves részletgazdagság – művészi, ecsetszerű vonalak.",
    price: 19990,
    image: "/icons/Angyalbaba 2.png",
    category: "parna",
    form: "origin",
    style: "atelier",
    dimensions: "1:1 arány, ~45 cm",
    material: "OEKO-TEX® minősítésű pamut huzat és cérna, hipoallergén töltet",
    features: [
      "OEKO-TEX® tanúsított",
      "Hipoallergén töltet",
      "Mosógépben mosható",
      "Kézzel készült",
      "Díszdoboz",
    ],
    customizable: true,
    customFields: babyCustomFields,
  },
  {
    id: "nova-core",
    name: "NOVA Core",
    slug: "nova-core",
    description:
      "Lendületesebb, dinamikusabb, hason fekvő pozíció. Skandináv minimalizmus – letisztult, egyvonalas baba körvonal.",
    price: 14990,
    image: "/icons/Korababa.png",
    category: "parna",
    form: "nova",
    style: "core",
    dimensions: "1:1 arány, ~45 cm",
    material: "OEKO-TEX® minősítésű pamut huzat és cérna, hipoallergén töltet",
    features: [
      "OEKO-TEX® tanúsított",
      "Hipoallergén töltet",
      "Mosógépben mosható",
      "Kézzel készült",
    ],
    customizable: true,
    customFields: babyCustomFields,
  },
  {
    id: "nova-linea",
    name: "NOVA Linea",
    slug: "nova-linea",
    description:
      "Lendületesebb, dinamikusabb, hason fekvő pozíció. Megszakítás nélküli vonalvezetés – folyamatos, áramló kontúr.",
    price: 16990,
    image: "/icons/Korababa.png",
    category: "parna",
    form: "nova",
    style: "linea",
    dimensions: "1:1 arány, ~45 cm",
    material: "OEKO-TEX® minősítésű pamut huzat és cérna, hipoallergén töltet",
    features: [
      "OEKO-TEX® tanúsított",
      "Hipoallergén töltet",
      "Mosógépben mosható",
      "Kézzel készült",
    ],
    customizable: true,
    customFields: babyCustomFields,
  },
  {
    id: "nova-atelier",
    name: "NOVA Atelier",
    slug: "nova-atelier",
    description:
      "Lendületesebb, dinamikusabb, hason fekvő pozíció. Kézműves részletgazdagság – művészi, ecsetszerű vonalak.",
    price: 19990,
    image: "/icons/Korababa 2.png",
    category: "parna",
    form: "nova",
    style: "atelier",
    dimensions: "1:1 arány, ~45 cm",
    material: "OEKO-TEX® minősítésű pamut huzat és cérna, hipoallergén töltet",
    features: [
      "OEKO-TEX® tanúsított",
      "Hipoallergén töltet",
      "Mosógépben mosható",
      "Kézzel készült",
      "Díszdoboz",
    ],
    customizable: true,
    customFields: babyCustomFields,
  },
  {
    id: "poszter-origin",
    name: "ORIGIN Poszter",
    slug: "origin-poszter",
    description:
      "Gyönyörű babaposzter a magzati pozícióban ábrázolt kisbabáddal és a születési adataival. Tökéletes babaszoba dekoráció.",
    price: 7990,
    image: "/icons/Angyalbaba.png",
    category: "poszter",
    form: "origin",
    style: "core",
    dimensions: "A3 (30×42 cm)",
    material: "250g prémium matt papír",
    features: [
      "Prémium nyomtatás",
      "250g matt papír",
      "Egyedi design",
      "Keretbe illeszthető",
    ],
    customizable: true,
    customFields: babyCustomFields,
  },
  {
    id: "poszter-nova",
    name: "NOVA Poszter",
    slug: "nova-poszter",
    description:
      "Dinamikus, hason fekvő pozíciójú babaposzter a kisbabád születési adataival. Elegáns babaszoba dekoráció.",
    price: 7990,
    image: "/icons/Korababa.png",
    category: "poszter",
    form: "nova",
    style: "core",
    dimensions: "A3 (30×42 cm)",
    material: "250g prémium matt papír",
    features: [
      "Prémium nyomtatás",
      "250g matt papír",
      "Egyedi design",
      "Keretbe illeszthető",
    ],
    customizable: true,
    customFields: babyCustomFields,
  },
];

export function getProductBySlug(slug: string): ProductVariant | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(
  category: "parna" | "poszter"
): ProductVariant[] {
  return products.filter((p) => p.category === category);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: "HUF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
