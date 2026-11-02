// Better Auth's endpoints (sign-in, two-factor, password reset, sign-out); see src/lib/auth.
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
