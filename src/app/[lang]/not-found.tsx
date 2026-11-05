import { NotFoundView } from "@/components/layout/NotFoundView";

// Root params are not available here, so the message is shown in all three languages.
export default function NotFound() {
  return <NotFoundView />;
}
