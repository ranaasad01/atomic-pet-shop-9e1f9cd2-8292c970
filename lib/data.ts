export interface NavLink {
  label: string;
  href: string;
  key: string;
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "/", key: "home" },
  { label: "Pets", href: "#pets-grid", key: "pets" },
  { label: "Shop", href: "#shop", key: "shop" },
];

export const BRAND = {
  name: "Pet Pals",
  tagline: "Take care of your furry friends!",
  emoji: "🐾",
} as const;

export type PetId = "dog" | "cat" | "bunny" | "hamster";

export interface Pet {
  id: PetId;
  name: string;
  emoji: string;
  hunger: number;
  happiness: number;
  color: string;
  species: string;
}
