"use client";

import { useState, useTransition } from "react";

type Category = { id: number; name: string; color: string };
type DataPoint = Record<string, number | string>;

interface Props {
  categories: Category[];
  data: DataPoint[];
  onReset: (categoryId: number) => void;
}

export default function StatsCards({ categories, data, onReset }: Props) {
  const latest = data[data.length - 1] ?? {};
  const [confirming, setConfirming] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleReset(cat: Category) {
    if (confirming === cat.id) {
      startTransition(async () => {
        await fetch(`/api/reset?category_id=${cat.id}`, { method: "DELETE" });
        setConfirming(null);
        onReset(cat.id);
      });
    } else {
      setConfirming(cat.id);
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {categories.map((cat) => {
        const val = (latest[cat.name] as number) ?? 0;
        const active = val > 0;
        const isConfirming = confirming === cat.id;

        return (
          <div
            key={cat.id}
            className="rounded-none p-4 group relative transition-all"
            style={{
              background: "var(--bg-card)",
              border: `1px solid ${active ? cat.color + "55" : "var(--green-border)"}`,
              boxShadow: active ? `0 0 12px ${cat.color}18` : "none",
            }}
            onMouseLeave={() => { if (!isPending) setConfirming(null); }}
          >
            <p className="text-xs tracking-widest truncate" style={{ color: "var(--green-muted)" }}>
              {cat.name.toUpperCase()}
            </p>
            <p
              className="mt-2 text-2xl font-bold"
              style={{
                color: active ? cat.color : "var(--green-muted)",
                textShadow: active ? `0 0 10px ${cat.color}88` : "none",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {val.toFixed(1)}
              <span className="text-xs font-normal ml-1" style={{ color: "var(--green-muted)" }}>H</span>
            </p>
            <p className="text-xs mt-1 tracking-widest" style={{ color: "var(--green-border)" }}>/30D</p>

            {/* Per-category reset */}
            <button
              onClick={() => handleReset(cat)}
              disabled={isPending}
              className="absolute top-2 right-2 text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5"
              style={{
                color: isConfirming ? "#ff4141" : "var(--green-muted)",
                border: `1px solid ${isConfirming ? "#ff414155" : "var(--green-border)"}`,
                background: "var(--bg-card)",
              }}
              title={isConfirming ? "Click to confirm reset" : "Reset this category's entries"}
            >
              {isConfirming ? "CONFIRM?" : "↺"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
