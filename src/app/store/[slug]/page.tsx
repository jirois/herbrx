import { ProductDetail } from "@/components/product/product-detail";

// ProductDetail now self-fetches via useStoreProduct(slug) — this page is
// just a pass-through. If a page already exists at this path doing a
// server-side static-data lookup, replace it with this.
export default function Page({ params }: { params: { slug: string } }) {
  return <ProductDetail product={params.slug} />;
}
