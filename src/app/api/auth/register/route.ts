import type { NextRequest } from "next/server";
import { registerSchema } from "@/lib/schemas";
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

  // Frontend mengirim confirmPassword; backend hanya menerima email + password.
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      400,
      "VALIDATION_ERROR",
      "Input tidak valid",
      parsed.error.issues.map((i) => ({ path: i.path.map(String).join("."), message: i.message }))
    );
  }

  const { email, password } = parsed.data;
  // Backend langsung memberi token saat register, jadi pengguna otomatis masuk.
  return authenticate("/api/auth/register", { email, password }, true);
}
