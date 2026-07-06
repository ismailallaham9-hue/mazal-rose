/**
 * Central site configuration.
 *
 * ⚠️ REPLACE THE PLACEHOLDER VALUES BELOW with your real business details.
 * Everything trust/marketing-related (WhatsApp, reviews, socials, stats)
 * reads from here, so you update them in exactly one place.
 */

export const SITE = {
  name: "MAZAL",
  tagline: "MAZAL means Still.",
  url: "https://mazal.ae", // production domain

  currency: "AED",
  freeShippingThreshold: 500, // AED — drives the cart free-shipping progress bar
  firstOrderCode: "STILL10",
  firstOrderDiscount: 10, // %

  // ── WhatsApp (TODO: replace with your business number, digits only, intl) ──
  whatsapp: {
    number: "971501507711",
    defaultMessage: "Hello MAZAL — I'd like to know more.",
    stylingMessage:
      "Hello MAZAL — I'd love a personal styling consultation.",
    orderSupportMessage: "Hello MAZAL — I need help with my order.",
  },

  // ── Reviews (TODO: replace with your Google review link) ──
  googleReviewUrl: "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID", // TODO
  ratingAverage: 4.9, // sitewide average (TODO: keep in sync with Google)
  ratingCount: 1842, // total reviews (TODO)

  // ── Socials (TODO: replace handles/links) ──
  social: {
    instagram: "https://www.instagram.com/mazal_ae",
    instagramHandle: "@mazal_ae",
    tiktok: "https://tiktok.com/@mazal", // TODO
    pinterest: "https://pinterest.com/mazal", // TODO
  },

  // ── Store statistics (sample — TODO: replace with real numbers) ──
  stats: [
    { value: "120K+", label: "Pieces delivered" },
    { value: "4.9★", label: "Average rating" },
    { value: "60+", label: "Countries shipped" },
    { value: "98%", label: "Would recommend" },
  ],

  contact: {
    email: "care@mazal.example", // TODO
    phone: "+971 50 000 0000", // TODO
    addressLine: "Dubai Design District, Dubai, UAE", // TODO
    hours: "Sun–Thu, 9am–6pm GST",
  },
} as const;

/** Build a wa.me deep link with a pre-filled message. */
export function whatsappNumber(value: string = SITE.whatsapp.number): string {
  return value.replace(/\D/g, "");
}

export function whatsappLink(message?: string, number: string = SITE.whatsapp.number): string {
  const text = encodeURIComponent(message ?? SITE.whatsapp.defaultMessage);
  return `https://wa.me/${whatsappNumber(number)}?text=${text}`;
}
