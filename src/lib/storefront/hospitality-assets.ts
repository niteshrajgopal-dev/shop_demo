/** Venue photography and tags aligned with the design handoff asset set. */
export const HOSPITALITY_VENUE_PHOTOS = [
  "/assets/venue-soho.png",
  "/assets/venue-shoreditch.png",
  "/assets/venue-marylebone.png",
] as const;

export const HOSPITALITY_VENUE_TAGS = ["Flagship", "Roastery", "New"] as const;

export function hospitalityVenuePhoto(index: number): string {
  return HOSPITALITY_VENUE_PHOTOS[index % HOSPITALITY_VENUE_PHOTOS.length];
}

export function hospitalityVenueTag(index: number): string {
  return HOSPITALITY_VENUE_TAGS[index % HOSPITALITY_VENUE_TAGS.length];
}

const SHOP_COFFEE_IMAGES: Record<string, string> = {
  "ethiopia-yirgacheffe": "/assets/craft-cherries.png",
  "signature-blend": "/assets/craft-roaster.png",
  "kenya-nyeri-aa": "/assets/craft-pour.png",
  "colombia-huila": "/assets/craft-barista.png",
  "guatemala-antigua-decaf": "/assets/photo-story.png",
  "sumatra-mandheling": "/assets/photo-beans-fall.png",
};

const SHOP_IMAGE_FALLBACKS = [
  "/assets/craft-cherries.png",
  "/assets/craft-roaster.png",
  "/assets/craft-pour.png",
  "/assets/craft-barista.png",
  "/assets/photo-story.png",
  "/assets/photo-beans-fall.png",
] as const;

export function shopCoffeeImage(slug: string, index = 0): string {
  return SHOP_COFFEE_IMAGES[slug] ?? SHOP_IMAGE_FALLBACKS[index % SHOP_IMAGE_FALLBACKS.length];
}
