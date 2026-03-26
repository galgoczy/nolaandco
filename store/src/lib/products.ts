export interface ProductVariant {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: "parna" | "poszter";
  style: string;
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
    label: "Születési súly (g)",
    type: "text",
    placeholder: "pl. 3250 g",
    required: true,
  },
  {
    name: "birthLength",
    label: "Születési hossz (cm)",
    type: "text",
    placeholder: "pl. 50 cm",
    required: true,
  },
  {
    name: "birthTime",
    label: "Születési idő",
    type: "text",
    placeholder: "pl. 14:30",
    required: false,
  },
];

export const products: ProductVariant[] = [
  {
    id: "parna-angyalbaba",
    name: "Angyalbaba Párna",
    slug: "angyalbaba-parna",
    description:
      "Finom angyalszárnyakkal díszített babapárna, a kisbabád születési adataival egyedi hímzéssel. Puha, ölelni való darab, ami örök emlék marad.",
    price: 14990,
    image: "/icons/Angyalbaba.png",
    category: "parna",
    style: "Angyalbaba",
    dimensions: "35×35 cm",
    material: "100% pamut, Oeko-Tex minősítés",
    features: [
      "Egyedi hímzés",
      "Oeko-Tex pamut",
      "Kézzel készült",
      "Mosógépben mosható",
    ],
    customizable: true,
    customFields: babyCustomFields,
  },
  {
    id: "parna-korababa",
    name: "Korababa Párna",
    slug: "korababa-parna",
    description:
      "Vintage ihletésű babapárna gyönyörű korabeli stílusú rajzokkal. A kisbabád adatai finoman hímezve kerülnek a párnára.",
    price: 14990,
    image: "/icons/Korababa.png",
    category: "parna",
    style: "Korababa",
    dimensions: "35×35 cm",
    material: "100% pamut, Oeko-Tex minősítés",
    features: [
      "Egyedi hímzés",
      "Oeko-Tex pamut",
      "Kézzel készült",
      "Mosógépben mosható",
    ],
    customizable: true,
    customFields: babyCustomFields,
  },
  {
    id: "parna-angyalbaba-natur",
    name: "Angyalbaba Natúr Párna",
    slug: "angyalbaba-natur-parna",
    description:
      "Természetes, natúr színvilágú angyalbaba párna. Letisztult elegancia a kisbabád születési adataival.",
    price: 14990,
    image: "/icons/Angyalbaba 2.png",
    category: "parna",
    style: "Angyalbaba Natúr",
    dimensions: "35×35 cm",
    material: "100% pamut, Oeko-Tex minősítés",
    features: [
      "Egyedi hímzés",
      "Oeko-Tex pamut",
      "Kézzel készült",
      "Mosógépben mosható",
    ],
    customizable: true,
    customFields: babyCustomFields,
  },
  {
    id: "parna-korababa-natur",
    name: "Korababa Natúr Párna",
    slug: "korababa-natur-parna",
    description:
      "Természetes tónusú korababa párna, visszafogott eleganciával. A születési adatok finoman hímezve.",
    price: 14990,
    image: "/icons/Korababa 2.png",
    category: "parna",
    style: "Korababa Natúr",
    dimensions: "35×35 cm",
    material: "100% pamut, Oeko-Tex minősítés",
    features: [
      "Egyedi hímzés",
      "Oeko-Tex pamut",
      "Kézzel készült",
      "Mosógépben mosható",
    ],
    customizable: true,
    customFields: babyCustomFields,
  },
  {
    id: "parna-angyalbaba-premium",
    name: "Angyalbaba Prémium Párna",
    slug: "angyalbaba-premium-parna",
    description:
      "Prémium anyagokból készült angyalbaba párna, extra részletgazdag hímzéssel. A legtökéletesebb ajándék.",
    price: 17990,
    image: "/icons/Angyalbaba.png",
    category: "parna",
    style: "Angyalbaba Prémium",
    dimensions: "40×40 cm",
    material: "Prémium pamut-len keverék, Oeko-Tex",
    features: [
      "Prémium hímzés",
      "Pamut-len keverék",
      "Kézzel készült",
      "Díszdobozban",
    ],
    customizable: true,
    customFields: babyCustomFields,
  },
  {
    id: "parna-korababa-premium",
    name: "Korababa Prémium Párna",
    slug: "korababa-premium-parna",
    description:
      "Prémium korababa párna, luxus anyagokkal és extra finomságú hímzéssel. Díszdobozban érkezik.",
    price: 17990,
    image: "/icons/Korababa.png",
    category: "parna",
    style: "Korababa Prémium",
    dimensions: "40×40 cm",
    material: "Prémium pamut-len keverék, Oeko-Tex",
    features: [
      "Prémium hímzés",
      "Pamut-len keverék",
      "Kézzel készült",
      "Díszdobozban",
    ],
    customizable: true,
    customFields: babyCustomFields,
  },
  {
    id: "poszter-angyalbaba",
    name: "Angyalbaba Poszter",
    slug: "angyalbaba-poszter",
    description:
      "Gyönyörű babaposzter angyalszárnyakkal és a kisbabád születési adataival. Tökéletes dekoráció a babaszobába.",
    price: 7990,
    image: "/icons/Angyalbaba.png",
    category: "poszter",
    style: "Angyalbaba",
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
    id: "poszter-korababa",
    name: "Korababa Poszter",
    slug: "korababa-poszter",
    description:
      "Vintage stílusú babaposzter a kisbabád születési adataival. Elegáns dekoráció, ami minden babaszobába illik.",
    price: 7990,
    image: "/icons/Korababa.png",
    category: "poszter",
    style: "Korababa",
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
