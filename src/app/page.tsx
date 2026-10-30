// src/app/page.tsx
import type { Metadata } from "next";
import { PromotionalView } from "@/components/promotional/promotional-view";

export const metadata: Metadata = {
  title: "IroWa — Discover. Share. Be Prepared. | Irosin Water Resources Map",
  description:
    "Find and explore water resources in Irosin, Sorsogon. From natural springs to resorts, IroWa helps you stay informed, connected, and ready — especially during droughts and emergencies.",
  openGraph: {
    title: "IroWa — Discover. Share. Be Prepared.",
    description:
      "Find and explore water resources in Irosin, Sorsogon. From natural springs to resorts, IroWa helps you stay informed, connected, and ready.",
    url: "/",
    siteName: "IroWa",
    images: [
      {
        url: "/images/promo-poster.jpg",
        width: 800,
        height: 600,
        alt: "IroWa Irosin Water Resources Map",
      },
    ],
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IroWa — Discover. Share. Be Prepared.",
    description:
      "Find and explore water resources in Irosin, Sorsogon. From natural springs to resorts, IroWa helps you stay informed, connected, and ready.",
    images: ["/images/promo-poster.jpg"],
  },
};

export default function RootLandingPage() {
  return <PromotionalView />;
}
