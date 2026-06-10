import { EmptyState } from "@/components/ui/empty-state";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-(--cream)">
      <EmptyState
        emoji="🔍"
        title="Product Not Found"
        description="This product doesn't exist or may have been removed. Browse our full range of verified herbal products."
        action={{ label: "Browse Products", href: "/store" }}
        secondaryAction={{ label: "Go Home", href: "/" }}
      />
    </div>
  );
}
