import { Hero } from "@/components/hero/hero";
import { BlogSection } from "@/components/sections/blog-section";
import { Footer } from "@/components/sections/footer";
import { Newsletter } from "@/components/sections/newsletter";
import { Testimonials } from "@/components/sections/testimonials";
import { WhySection } from "@/components/sections/why-section";
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
      <WhySection />
      <Testimonials />
      <BlogSection />
      <Newsletter />

      <Footer />
    </>
  );
}
