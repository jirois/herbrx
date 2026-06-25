import { EmptyState } from "../components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-(--cream)">
      <EmptyState
        emoji="🌿"
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved. Let's get you back on track."
        action={{ label: "Go to Store", href: "/store" }}
        secondaryAction={{ label: "Back to Home", href: "/" }}
      />
    </div>
  );
}
