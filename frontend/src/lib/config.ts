export const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const HOME_IMAGES = {
  hero: "/home/hero-main.png",
  service: "/home/service-main.png",
  storyMain: "/home/story-collage.png",
  storySecondary: "/home/story-collage.png",
  categories: ["/home/category-pitbikes.png", "/home/category-config.png", "/home/category-parts.png", "/home/category-service.png"],
} as const;

export const HERO_IMAGE = HOME_IMAGES.hero;
export const WORKSHOP_IMAGE = HOME_IMAGES.service;
