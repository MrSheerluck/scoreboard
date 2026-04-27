"use client";

import { useCallback, useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import MomentumChart from "@/components/MomentumChart";
import LogForm from "@/components/LogForm";
import StatsCards from "@/components/StatsCards";
import RecentEntries from "@/components/RecentEntries";
import { applyMatrixColors } from "@/lib/theme";

type Category = { id: number; name: string; color: string };
type DataPoint = Record<string, number | string>;
type Entry = { id: number; category: string; color: string; hours: number; date: string };

export default function Home() {
  const { user } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [chartRes, entriesRes] = await Promise.all([
      fetch("/api/chart"),
      fetch("/api/entries"),
    ]);
    const { categories: cats, data } = await chartRes.json() as { categories: Category[]; data: DataPoint[] };
    const recentEntries = await entriesRes.json() as Entry[];
    setCategories(applyMatrixColors(cats));
    setChartData(data);
    setEntries(recentEntries);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const now = new Date().toLocaleDateString("en-US", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  }).toUpperCase();

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: "var(--green-border)" }}>
          <div>
            <h1 className="text-3xl font-bold tracking-widest glow-strong" style={{ color: "var(--green)" }}>
              SCOREBOARD
            </h1>
            <p className="text-xs mt-1 tracking-widest" style={{ color: "var(--green-muted)" }}>
              &gt; 30-DAY ROLLING MOMENTUM TRACKER
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs tracking-widest glow" style={{ color: "var(--green-dim)" }}>{now}</p>
              {user && (
                <p className="text-xs mt-0.5 tracking-widest truncate max-w-[160px]" style={{ color: "var(--green-muted)" }}>
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              )}
            </div>
            {/* Clerk user button — avatar + sign-out menu */}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: {
                    width: "32px",
                    height: "32px",
                    border: "1px solid #1a3a1a",
                    borderRadius: "0px",
                  },
                  userButtonPopoverCard: {
                    background: "#000",
                    border: "1px solid #1a3a1a",
                    borderRadius: "0px",
                    boxShadow: "0 0 20px rgba(0,255,65,0.1)",
                  },
                  userButtonPopoverActionButton: { color: "#00cc33" },
                  userButtonPopoverActionButtonText: { color: "#00cc33" },
                  userButtonPopoverFooter: { display: "none" },
                },
              }}
            />
          </div>
        </div>

        {/* Stats */}
        {!loading && <StatsCards categories={categories} data={chartData} />}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

          {/* Chart */}
          <div className="m-card rounded-none p-5">
            <p className="text-xs tracking-widest mb-5" style={{ color: "var(--green-dim)" }}>
              &gt; MOMENTUM // 30-DAY ROLLING HOURS
            </p>
            {loading ? (
              <div className="flex items-center justify-center h-64 text-xs tracking-widest" style={{ color: "var(--green-muted)" }}>
                LOADING DATA...
              </div>
            ) : (
              <MomentumChart categories={categories} data={chartData} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {!loading && <LogForm categories={categories} onLogged={refresh} />}

            <div className="m-card rounded-none p-4">
              <p className="text-xs tracking-widest mb-3" style={{ color: "var(--green-dim)" }}>
                &gt; RECENT ENTRIES
              </p>
              {loading ? (
                <p className="text-xs tracking-widest text-center py-4" style={{ color: "var(--green-muted)" }}>
                  LOADING...
                </p>
              ) : (
                <RecentEntries entries={entries} onDelete={refresh} />
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
