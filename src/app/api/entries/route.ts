import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDB, type Entry } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDB();
  const { results } = await db
    .prepare(
      `SELECT e.id, e.category_id, c.name as category, c.color, e.hours, e.date, e.description, e.created_at
       FROM entries e
       JOIN categories c ON c.id = e.category_id
       WHERE e.user_id = ?
       ORDER BY e.date DESC, e.created_at DESC
       LIMIT 50`
    )
    .bind(userId)
    .all<Entry & { category: string; color: string }>();

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { category_id?: unknown; hours?: unknown; date?: unknown; description?: unknown };
  const { category_id, hours, date, description } = body;

  if (!category_id || !hours || !date) {
    return NextResponse.json({ error: "category_id, hours, date required" }, { status: 400 });
  }
  if (typeof hours !== "number" || hours <= 0) {
    return NextResponse.json({ error: "hours must be a positive number" }, { status: 400 });
  }
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  }

  const db = await getDB();
  const cat = await db
    .prepare("SELECT id FROM categories WHERE id = ? AND user_id = ?")
    .bind(category_id as number, userId)
    .first();
  if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  const desc = typeof description === "string" ? description.slice(0, 200) : "";

  const result = await db
    .prepare(
      "INSERT INTO entries (category_id, hours, date, description, user_id) VALUES (?, ?, ?, ?, ?) RETURNING *"
    )
    .bind(category_id as number, hours as number, date, desc, userId)
    .first<Entry>();

  return NextResponse.json(result, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = await getDB();
  await db
    .prepare("DELETE FROM entries WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .run();

  return NextResponse.json({ ok: true });
}
