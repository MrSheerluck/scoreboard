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

// Spread seed entries across the last 30 days so new users see a real chart
const SEED_PATTERNS: Record<string, [number, number][]> = {
  "Chess":      [[1,2.5],[3,1.5],[5,3.0],[8,2.0],[12,1.5],[16,2.5],[20,2.0],[26,1.0]],
  "Game Dev":   [[2,2.0],[4,3.0],[7,1.5],[11,2.5],[17,1.0],[23,2.0]],
  "Reading":    [[1,1.0],[2,1.5],[4,1.0],[6,2.0],[9,1.0],[14,1.5],[19,1.0],[27,0.5]],
  "Philosophy": [[3,1.5],[9,2.0],[16,1.0],[25,1.5]],
  "Product":    [[2,3.0],[6,2.0],[11,2.5],[20,1.5]],
};

function dateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

async function seedDefaults(db: D1Database, userId: string) {
  // Insert categories
  await db.batch(
    DEFAULT_CATEGORIES.map((name, i) =>
      db.prepare("INSERT OR IGNORE INTO categories (name, color, user_id) VALUES (?, ?, ?)")
        .bind(name, PALETTE[i], userId)
    )
  );

  // Fetch back the created IDs
  const { results: cats } = await db
    .prepare("SELECT id, name FROM categories WHERE user_id = ? ORDER BY name")
    .bind(userId)
    .all<{ id: number; name: string }>();

  // Insert seed entries
  const entryStmts = cats.flatMap((cat) =>
    (SEED_PATTERNS[cat.name] ?? []).map(([daysAgo, hours]) =>
      db.prepare("INSERT INTO entries (category_id, hours, date, user_id) VALUES (?, ?, ?, ?)")
        .bind(cat.id, hours, dateOffset(daysAgo), userId)
    )
  );

  if (entryStmts.length > 0) await db.batch(entryStmts);
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
    .prepare("INSERT INTO categories (name, color, user_id) VALUES (?, ?, ?) RETURNING id, name, color")
    .bind(name.trim(), color, userId)
    .first<Category>();

  return NextResponse.json(result, { status: 201 });
}
