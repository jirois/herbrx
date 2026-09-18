import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, badRequest, serverError } from "@/lib/api-helpers";

// POST /api/dashboard/settings/password  { currentPassword, newPassword }
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id } = session!.user as { id: string };
    const { currentPassword, newPassword } = await req.json();

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return badRequest("currentPassword and newPassword are required");
    }
    if (newPassword.length < 8) {
      return badRequest("New password must be at least 8 characters");
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { passwordHash: true },
    });
    if (!user?.passwordHash) {
      return badRequest(
        "This account has no password set (signed up via a social provider)",
      );
    }

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) return badRequest("Current password is incorrect");

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id }, data: { passwordHash } });

    return ok({ success: true });
  } catch (e) {
    return serverError(e);
  }
}
