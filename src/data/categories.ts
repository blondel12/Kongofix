export interface Category {
  name: string;
  icon: string;
  slug: string;
  techCount: number;
}

export const categories: Category[] = [
  { name: "Électricien", icon: "⚡", slug: "electricien", techCount: 12 },
  { name: "Plombier", icon: "🔧", slug: "plombier", techCount: 9 },
  { name: "Menuisier", icon: "🪚", slug: "menuisier", techCount: 7 },
  { name: "Peintre", icon: "🎨", slug: "peintre", techCount: 5 },
  { name: "Climatisation", icon: "❄️", slug: "climatisation", techCount: 11 },
  { name: "Électroménager", icon: "🧺", slug: "electromenager", techCount: 6 },
  { name: "Mécanicien mobile", icon: "🚗", slug: "mecanicien-mobile", techCount: 8 },
  { name: "Caméras de surveillance", icon: "📹", slug: "cameras-surveillance", techCount: 4 },
  { name: "Internet / Wi-Fi", icon: "📡", slug: "internet-wifi", techCount: 7 },
  { name: "Systèmes solaires", icon: "☀️", slug: "systemes-solaires", techCount: 5 },
];
