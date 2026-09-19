export type BouquetId = "blush" | "ivory" | "meadow";

export type Bouquet = {
  id: BouquetId;
  num: string;
  name: string;
  label: string;
  flowers: string;
  bg: string;
  img: string;
  alt: string;
  desc: string;
};

export type Occasion = {
  num: string;
  title: string;
  text: string;
  id: BouquetId;
};

export const FLOREA_VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

export const bouquets: Bouquet[] = [
  {
    id: "blush",
    num: "01",
    name: "The Blush Edit",
    label: "A little romance",
    flowers: "Peonies · Garden roses · Cosmos",
    bg: "#EEE5DF",
    img: "/florea/blush.png",
    alt: "Blush peonies, peach garden roses and white cosmos tied with ivory ribbon",
    desc:
      "Abundant blush peonies gathered with peach garden roses and delicate white cosmos, finished with a hand-tied ivory ribbon. Soft, generous and quietly romantic.",
  },
  {
    id: "ivory",
    num: "02",
    name: "Quiet Poetry",
    label: "Simply timeless",
    flowers: "White roses · Ranunculus · Sweet peas",
    bg: "#E9EBE1",
    img: "/florea/ivory.png",
    alt: "Airy white bouquet with eucalyptus and an ivory ribbon",
    desc:
      "An airy gathering of white roses, ranunculus and sweet peas among silvery eucalyptus. Calm and classic, for the moments that ask for grace.",
  },
  {
    id: "meadow",
    num: "03",
    name: "A Little Wild",
    label: "Naturally joyful",
    flowers: "Cosmos · Scabiosa · Daisies",
    bg: "#EEE9DE",
    img: "/florea/meadow.png",
    alt: "Butter-yellow cosmos, mauve scabiosa, creamy daisies and sage foliage",
    desc:
      "Butter-yellow cosmos, soft mauve scabiosa and creamy daisies loosely arranged with sage foliage. Like a meadow picked on a warm afternoon.",
  },
];

export const occasions: Occasion[] = [
  { num: "01", title: "Just because", text: "No occasion is an occasion.", id: "blush" },
  { num: "02", title: "A day to celebrate", text: "Birthdays, milestones & happy news.", id: "meadow" },
  { num: "03", title: "With love", text: "For your favourite person.", id: "blush" },
  { num: "04", title: "A little thank you", text: "When a few words aren't enough.", id: "ivory" },
];

export function bouquetById(id: BouquetId | null): Bouquet | null {
  if (!id) return null;
  return bouquets.find((bouquet) => bouquet.id === id) ?? null;
}
