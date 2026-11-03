"use server";

import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { previewPath } from "@/lib/preview";

/** Leaves the preview and reloads the same page as visitors see it. */
export async function exitPreview(form: FormData) {
  (await draftMode()).disable();
  redirect(previewPath(form.get("path")) ?? "/es");
}
