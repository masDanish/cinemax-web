import type { NextRequest } from "next/server";
import { loginSchema } from "@/lib/schemas";
import {
  authenticate,
  errorResponse,
  isSameOrigin,
  readJson,
} from "@/lib/route-helpers";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return errorResponse(403, "FORBIDDEN", "Origin tidak diizinkan");

  const body = await readJson(req);
  if (body === undefined) {
    return errorResponse(400, "INVALID_JSON", "Body harus berupa JSON yang valid");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      400,
      "VALIDATION_ERROR",
      "Input tidak valid",
      parsed.error.issues.map((i) => ({ path: i.path.map(String).join("."), message: i.message }))
    );
  }

  const { remember, ...credentials } = parsed.data;
  return authenticate("/api/auth/login", credentials, remember ?? false);
}
