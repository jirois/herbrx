import { Hero } from "@/components/hero/hero";
import { BlogSection } from "@/components/sections/blog-section";
import { Footer } from "@/components/sections/footer";
import { Newsletter } from "@/components/sections/newsletter";
import { Testimonials } from "@/components/sections/testimonials";
import { WhySection } from "@/components/sections/why-section";
import { Services } from "@/components/services/services";
import { Products } from "@/components/store/products";
import { TrustBar } from "@/components/trust/trust-bar";
import { getLatestPublishedPost } from "@/lib/blog";

export default async function Homepage() {
  const latest = await getLatestPublishedPost();

  return (
    <>
      <Hero
        latestPost={
          latest
            ? {
                title: latest.title,
                category: latest.category,
                publishedAt: latest.date,
              }
            : null
        }
      />
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
