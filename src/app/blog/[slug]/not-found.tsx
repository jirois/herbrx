import { EmptyState } from "@/components/ui/empty-state";

export default function BlogPostNotFound() {
  return (
    <div className="min-h-screen bg-(--cream)">
      <EmptyState
        emoji="📝"
        title="Article Not Found"
        description="This article doesn't exist or has been removed. Browse our full library of herbal health guides."
        action={{ label: "Browse Articles", href: "/blog" }}
        secondaryAction={{ label: "Go Home", href: "/" }}
      />
    </div>
  );
}
