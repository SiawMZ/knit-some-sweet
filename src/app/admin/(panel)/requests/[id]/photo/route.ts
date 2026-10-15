import { auth } from "@/auth";
import { db } from "@/lib/server/db";

/** A drawing request's photo. Seller only. */
export async function GET(_request: Request, { params }: RouteContext<"/admin/requests/[id]/photo">) {
  if (!(await auth())?.user) return new Response(null, { status: 401 });
  const { id } = await params;
  const req = await db().drawingRequest.findUnique({ where: { id }, select: { photo: true, photoType: true } });
  if (!req) return new Response(null, { status: 404 });
  return new Response(req.photo, {
    headers: { "content-type": req.photoType, "cache-control": "private, max-age=3600" },
  });
}
