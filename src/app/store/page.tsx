import type { Metadata } from "next";
import { StorePage } from "@/components/store/store-page";

export const metadata: Metadata = {
  title: "Store — Verified Natural Products",
  description:
    "Browse HerbRx's full range of NAFDAC-compliant herbal products — teas, capsules, tinctures, and topicals, each independently verified for safety.",
};

export default function Store() {
  return <StorePage />;
}
