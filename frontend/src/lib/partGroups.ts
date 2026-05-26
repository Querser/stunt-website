import type { Part } from "./types";

export type PartGroup = {
  id: string;
  name: string;
  match: (text: string) => boolean;
};

export type PartGroupFilter = {
  id: string;
  name: string;
  count: number;
};

export const PART_GROUPS: PartGroup[] = [
  { id: "doublers", name: "Дублеры", match: (text) => hasAny(text, ["дублер", "дублёр", "гидролиния", "пластина дублера"]) },
  { id: "brakes", name: "Тормоз", match: (text) => hasAny(text, ["тормоз", "суппорт", "диски тормозные", "машинка тормозная"]) },
  { id: "wheels", name: "Колеса", match: (text) => hasAny(text, ["колес", "диск", "покрыш", "шина", "камера"]) },
  { id: "controls", name: "Рули / выжим", match: (text) => hasAny(text, ["руль", "ручк", "грипс", "рычаг", "выжим", "сцеплен", "трос"]) },
  { id: "protection", name: "Защита", match: (text) => hasAny(text, ["защита", "слайдер", "пег", "ось", "оси", "бугел", "бугель", "раундбар"]) },
  { id: "electric", name: "Электрика / свет", match: (text) => hasAny(text, ["электр", "фар", "подсвет", "аккумулятор", "провод"]) },
  { id: "engine", name: "Мотор / химия", match: (text) => hasAny(text, ["масло", "химия", "смаз", "очист", "выхлоп", "глушитель", "фильтр", "мотор", "двигател"]) },
  { id: "body", name: "Пластик / сиденья", match: (text) => hasAny(text, ["пластик", "сидень", "чехол", "пластина", "крышка"]) },
  { id: "gear", name: "Экип / мерч", match: (text) => hasAny(text, ["экип", "мерч", "одеж", "джерси", "перчат", "шлем", "очки"]) },
  { id: "other", name: "Аксессуары", match: () => true },
];

export function hasAny(text: string, tokens: string[]) {
  return tokens.some((token) => text.includes(token));
}

export function partSearchText(part: Part) {
  return [part.category.name, part.name, part.description, part.sku].filter(Boolean).join(" ").toLowerCase();
}

export function getPartGroup(part: Part) {
  const text = partSearchText(part);
  return PART_GROUPS.find((group) => group.match(text)) || PART_GROUPS[PART_GROUPS.length - 1];
}

export function buildPartGroups(parts: Part[]): PartGroupFilter[] {
  const counts = new Map<string, number>();
  parts.forEach((part) => {
    const group = getPartGroup(part);
    counts.set(group.id, (counts.get(group.id) || 0) + 1);
  });

  return [
    { id: "all", name: "Все товары", count: parts.length },
    ...PART_GROUPS.map((group) => ({ id: group.id, name: group.name, count: counts.get(group.id) || 0 })).filter((group) => group.count > 0),
  ];
}
