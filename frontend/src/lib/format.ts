import type { ImageAsset } from "./types";

export function formatPrice(value: number) {
  return value.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽";
}

export function getMainImage(images?: ImageAsset[], fallback = "https://picsum.photos/seed/stunt-tech/1200/900") {
  return images?.find((image) => image.is_main)?.image_url || images?.[0]?.image_url || fallback;
}

export function parseSpecs(specs?: string | null) {
  return (specs || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return {
        label: label.trim(),
        value: rest.join(":").trim(),
      };
    });
}

export function formatPhone(value: string) {
  let clean = value.replace(/\D/g, "");
  if (clean.startsWith("7") || clean.startsWith("8")) clean = clean.slice(1);
  let result = "+7";
  if (clean.length > 0) result += ` (${clean.substring(0, 3)}`;
  if (clean.length >= 4) result += `) ${clean.substring(3, 6)}`;
  if (clean.length >= 7) result += `-${clean.substring(6, 8)}`;
  if (clean.length >= 9) result += `-${clean.substring(8, 10)}`;
  return result;
}
