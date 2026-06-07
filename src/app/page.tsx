import { Hero } from "@/components/hero/hero";
import { Services } from "@/components/services/services";
import { Products } from "@/components/store/products";
import { TrustBar } from "@/components/trust/trust-bar";

export default function Homepage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Services />
      <Products />
    </>
  );
}
