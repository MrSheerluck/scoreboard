import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDB } from "@/lib/db";

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("category_id");

  const db = await getDB();

  if (categoryId) {
    const cat = await db
      .prepare("SELECT id FROM categories WHERE id = ? AND user_id = ?")
      .bind(categoryId, userId)
      .first();
    if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    await db
      .prepare("DELETE FROM entries WHERE category_id = ? AND user_id = ?")
      .bind(categoryId, userId)
      .run();
  } else {
    await db
      .prepare("DELETE FROM entries WHERE user_id = ?")
      .bind(userId)
      .run();
  }

  return NextResponse.json({ ok: true });
}
