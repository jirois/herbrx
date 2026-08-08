import { ProductDetail } from "@/components/product/product-detail";

// ProductDetail now self-fetches via useStoreProduct(slug) — this page is
// just a pass-through.
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ProductDetail slug={slug} />;
}
