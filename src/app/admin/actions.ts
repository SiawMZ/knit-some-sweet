"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { firstError, parseColorForm, parseItemForm, parseVesselForm } from "@/lib/catalog/admin";
import { checkPhoto, drawingRequestSchema } from "@/lib/drawings";
import { CATALOG_TAG } from "@/lib/catalog/queries";
import { db } from "@/lib/server/db";
import { requireSeller } from "@/lib/server/session";

/** What a form action reports back; `ok` with a message on success, otherwise an error. */
export type FormState = { error?: string; message?: string } | undefined;

const isCreate = (fd: FormData) => fd.get("mode") === "create";

async function missingColors(colorIds: string[]) {
  const found = await db().color.findMany({ where: { id: { in: colorIds } }, select: { id: true } });
  return colorIds.filter((id) => !found.some((c) => c.id === id));
}

export async function saveItem(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireSeller();
  const parsed = parseItemForm(fd);
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { colorIds, ...item } = parsed.data;
  if ((await missingColors(colorIds)).length) return { error: "One of those colors was just removed. Reload and try again." };
  const colors = colorIds.map((colorId, position) => ({ colorId, position }));

  if (isCreate(fd)) {
    if (await db().item.findUnique({ where: { id: item.id } })) {
      return { error: `An item called "${item.id}" already exists. Try another name.` };
    }
    const last = await db().item.aggregate({ _max: { position: true } });
    await db().item.create({
      data: { ...item, position: (last._max.position ?? -1) + 1, colors: { create: colors } },
    });
  } else {
    const { id, ...fields } = item;
    if (!(await db().item.findUnique({ where: { id } }))) return { error: "That item no longer exists." };
    await db().$transaction([
      db().itemColor.deleteMany({ where: { itemId: id } }),
      db().item.update({ where: { id }, data: { ...fields, colors: { create: colors } } }),
    ]);
  }
  updateTag(CATALOG_TAG);
  redirect("/admin/items");
}

export async function deleteItem(id: string): Promise<FormState> {
  await requireSeller();
  await db().item.deleteMany({ where: { id } });
  updateTag(CATALOG_TAG);
  redirect("/admin/items");
}

/** Customers always need at least one vase or wrap to pick. */
async function wouldLeaveNoVessel(exceptId: string) {
  const others = await db().vessel.count({ where: { active: true, id: { not: exceptId } } });
  return others === 0;
}

export async function saveVessel(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireSeller();
  const parsed = parseVesselForm(fd);
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { colorIds, ...vessel } = parsed.data;
  if ((await missingColors(colorIds)).length) return { error: "One of those colors was just removed. Reload and try again." };
  const colors = colorIds.map((colorId, position) => ({ colorId, position }));

  if (isCreate(fd)) {
    if (await db().vessel.findUnique({ where: { id: vessel.id } })) {
      return { error: `A vase or wrap called "${vessel.id}" already exists. Try another name.` };
    }
    const last = await db().vessel.aggregate({ _max: { position: true } });
    await db().vessel.create({
      data: { ...vessel, position: (last._max.position ?? -1) + 1, colors: { create: colors } },
    });
  } else {
    const { id, ...fields } = vessel;
    if (!(await db().vessel.findUnique({ where: { id } }))) return { error: "That vase or wrap no longer exists." };
    if (!fields.active && (await wouldLeaveNoVessel(id))) {
      return { error: "Keep at least one vase or wrap active, so customers can finish their bouquet." };
    }
    await db().$transaction([
      db().vesselColor.deleteMany({ where: { vesselId: id } }),
      db().vessel.update({ where: { id }, data: { ...fields, colors: { create: colors } } }),
    ]);
  }
  updateTag(CATALOG_TAG);
  redirect("/admin/vessels");
}

export async function deleteVessel(id: string): Promise<FormState> {
  await requireSeller();
  const vessel = await db().vessel.findUnique({ where: { id } });
  if (vessel?.active && (await wouldLeaveNoVessel(id))) {
    return { error: "Keep at least one vase or wrap active, so customers can finish their bouquet." };
  }
  await db().vessel.deleteMany({ where: { id } });
  updateTag(CATALOG_TAG);
  redirect("/admin/vessels");
}

export async function saveColor(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireSeller();
  const parsed = parseColorForm(fd);
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { id, ...color } = parsed.data;
  if (isCreate(fd)) {
    if (await db().color.findUnique({ where: { id } })) {
      return { error: `A color called "${id}" already exists. Try another name.` };
    }
    await db().color.create({ data: { id, ...color } });
  } else {
    await db().color.update({ where: { id }, data: color });
  }
  updateTag(CATALOG_TAG);
  refresh();
  return { message: isCreate(fd) ? `Added ${color.name}.` : `Saved ${color.name}.` };
}

export async function deleteColor(id: string): Promise<FormState> {
  await requireSeller();
  const color = await db().color.findUnique({
    where: { id },
    include: { _count: { select: { items: true, vessels: true } } },
  });
  if (!color) return undefined;
  const uses = color._count.items + color._count.vessels;
  if (uses > 0) {
    return { error: `${color.name} is still offered on ${uses} item${uses === 1 ? "" : "s"}. Remove it there first.` };
  }
  await db().color.delete({ where: { id } });
  updateTag(CATALOG_TAG);
  refresh();
  return { message: `Removed ${color.name}.` };
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}

export async function requestDrawing(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireSeller();
  const parsed = drawingRequestSchema.safeParse({
    name: fd.get("name") ?? "",
    kind: fd.get("kind") ?? "",
    notes: fd.get("notes") ?? "",
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const photo = fd.get("photo");
  const photoError = checkPhoto(photo instanceof File ? photo : null);
  if (photoError || !(photo instanceof File)) return { error: photoError ?? "Add a photo of the item." };

  await db().drawingRequest.create({
    data: {
      ...parsed.data,
      photo: new Uint8Array(await photo.arrayBuffer()),
      photoType: photo.type,
    },
  });
  refresh();
  return { message: `Sent! We'll draw your ${parsed.data.name} soon ✿` };
}

export async function dismissDrawing(id: string): Promise<FormState> {
  await requireSeller();
  await db().drawingRequest.updateMany({ where: { id, status: "waiting" }, data: { status: "dismissed" } });
  refresh();
  return undefined;
}
