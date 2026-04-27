import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getDB(): Promise<D1Database> {
  const ctx = await getCloudflareContext({ async: true });
  return ctx.env.scoreboard;
}

export type Category = {
  id: number;
  name: string;
  color: string;
};

export type Entry = {
  id: number;
  category_id: number;
  hours: number;
  date: string;
  description: string;
  created_at: string;
};

export type ChartRow = {
  date: string;
  category: string;
  color: string;
  rolling_sum: number;
};
