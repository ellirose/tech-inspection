import { serveUpload } from "@/lib/serve-upload";

export async function GET(_: Request, { params }: RouteContext<"/docs/uploads/[...key]">) {
  return serveUpload("docs/uploads", (await params).key);
}
