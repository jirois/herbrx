import { ProductDetail } from "@/components/product/product-detail";

// ProductDetail now self-fetches via useStoreProduct(slug) — this page is
// just a pass-through. If a page already exists at this path doing a
// server-side static-data lookup, replace it with this.
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
