import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDB, type Category } from "@/lib/db";

const PALETTE = [
  "#00ff41", "#39ff14", "#00ffcc", "#7fff00", "#ffffff",
  "#ccff00", "#00ff80", "#adff2f",
];

const DEFAULT_CATEGORIES = [
  "Chess", "Game Dev", "Reading", "Philosophy", "Product",
];

async function seedDefaults(db: D1Database, userId: string) {
  const stmts = DEFAULT_CATEGORIES.map((name, i) =>
    db.prepare("INSERT OR IGNORE INTO categories (name, color, user_id) VALUES (?, ?, ?)")
      .bind(name, PALETTE[i % PALETTE.length], userId)
  );
  await db.batch(stmts);
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDB();
  let { results } = await db
    .prepare("SELECT id, name, color FROM categories WHERE user_id = ? ORDER BY name")
    .bind(userId)
    .all<Category>();

  if (results.length === 0) {
    await seedDefaults(db, userId);
    ({ results } = await db
      .prepare("SELECT id, name, color FROM categories WHERE user_id = ? ORDER BY name")
      .bind(userId)
      .all<Category>());
  }

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { name?: unknown };
  const name = body.name;
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const db = await getDB();
  const count = await db
    .prepare("SELECT COUNT(*) as n FROM categories WHERE user_id = ?")
    .bind(userId)
    .first<{ n: number }>();
  const color = PALETTE[(count?.n ?? 0) % PALETTE.length];

  const result = await db
    .prepare(
      "INSERT INTO categories (name, color, user_id) VALUES (?, ?, ?) RETURNING id, name, color"
    )
    .bind(name.trim(), color, userId)
    .first<Category>();

  return NextResponse.json(result, { status: 201 });
}
