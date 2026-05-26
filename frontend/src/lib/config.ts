export const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const HOME_IMAGES = {
  hero: "/home/hero-new.png",
  service: "/home/service-new.png",
  storyMain: "/home/story-collage-new.png",
  storySecondary: "/home/story-collage-new.png",
  categories: ["/home/category-1-new.png", "/home/category-2-new.png", "/home/category-3-new.png", "/home/category-4-new.png"],
} as const;

export const HERO_IMAGE = HOME_IMAGES.hero;
export const WORKSHOP_IMAGE = HOME_IMAGES.service;
