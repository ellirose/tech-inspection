import { serveUpload } from "@/lib/serve-upload";

export async function GET(_: Request, { params }: RouteContext<"/media/uploads/[...key]">) {
  return serveUpload("media/uploads", (await params).key);
}
