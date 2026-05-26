export const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const HOME_IMAGES = {
  hero: "/home/hero.jpg",
  service: "/home/service.jpg",
  storyMain: "/home/story-1.jpg",
  storySecondary: "/home/story-2.jpg",
  categories: ["/home/category-1.jpg", "/home/category-2.jpg", "/home/category-3.jpg", "/home/category-4.jpg"],
} as const;

export const HERO_IMAGE = HOME_IMAGES.hero;
export const WORKSHOP_IMAGE = HOME_IMAGES.service;
