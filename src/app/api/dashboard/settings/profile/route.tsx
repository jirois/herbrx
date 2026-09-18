import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ok, badRequest, serverError } from "@/lib/api-helpers";

// GET /api/dashboard/settings/profile
// PATCH /api/dashboard/settings/profile
//
// Role-aware: producers get their business profile fields, everyone else
// gets their plain user profile. Email is intentionally read-only here —
// changing it belongs in a dedicated, verification-gated flow.
export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id, role } = session!.user as { id: string; role: string };
    const user = await prisma.user.findUnique({
      where: { id },
      select: { firstName: true, lastName: true, email: true, phone: true },
    });
    if (!user) return badRequest("User not found");

    if (role === "PRODUCER") {
      const profile = await prisma.producerProfile.findUnique({
        where: { userId: id },
      });
      return ok({
        ...user,
        businessName: profile?.businessName ?? "",
        website: profile?.website ?? "",
        address: profile?.address ?? "",
        description: profile?.description ?? "",
      });
    }

    return ok(user);
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  try {
    const { id, role } = session!.user as { id: string; role: string };
    const body = await req.json();
    const {
      firstName,
      lastName,
      phone,
      businessName,
      website,
      address,
      description,
    } = body;

    if (typeof firstName !== "string" || typeof lastName !== "string") {
      return badRequest("firstName and lastName are required");
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || null,
      },
      select: { firstName: true, lastName: true, email: true, phone: true },
    });

    if (role === "PRODUCER") {
      const profile = await prisma.producerProfile.update({
        where: { userId: id },
        data: {
          ...(businessName !== undefined
            ? { businessName: String(businessName).trim() }
            : {}),
          ...(website !== undefined
            ? { website: String(website).trim() || null }
            : {}),
          ...(address !== undefined
            ? { address: String(address).trim() || null }
            : {}),
          ...(description !== undefined
            ? { description: String(description).trim() || null }
            : {}),
        },
      });
      return ok({
        ...user,
        businessName: profile.businessName,
        website: profile.website ?? "",
        address: profile.address ?? "",
        description: profile.description ?? "",
      });
    }

    return ok(user);
  } catch (e) {
    return serverError(e);
  }
}
