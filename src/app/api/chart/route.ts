import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDB, type Category, type ChartRow } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDB();

  const categories = (
    await db
      .prepare("SELECT id, name, color FROM categories WHERE user_id = ? ORDER BY name")
      .bind(userId)
      .all<Category>()
  ).results;

  if (categories.length === 0) {
    return NextResponse.json({ categories: [], data: [] });
  }

  const rows = (
    await db
      .prepare(
        `WITH RECURSIVE date_series(dt) AS (
          SELECT date('now', '-29 days')
          UNION ALL
          SELECT date(dt, '+1 day') FROM date_series WHERE dt < date('now')
        )
        SELECT
          ds.dt                                 AS date,
          c.name                                AS category,
          c.color                               AS color,
          ROUND(COALESCE(SUM(e.hours), 0), 2)   AS rolling_sum
        FROM date_series ds
        CROSS JOIN categories c
        LEFT JOIN entries e
          ON  e.category_id = c.id
          AND e.user_id = ?
          AND e.date >= date(ds.dt, '-29 days')
          AND e.date <= ds.dt
        WHERE c.user_id = ?
        GROUP BY ds.dt, c.id
        ORDER BY ds.dt, c.name`
      )
      .bind(userId, userId)
      .all<ChartRow>()
  ).results;

  const byDate: Record<string, Record<string, number | string>> = {};
  for (const row of rows) {
    if (!byDate[row.date]) byDate[row.date] = { date: row.date };
    byDate[row.date][row.category] = row.rolling_sum;
  }

  return NextResponse.json({ categories, data: Object.values(byDate) });
}
