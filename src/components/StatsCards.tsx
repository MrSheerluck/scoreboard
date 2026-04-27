"use client";

type Category = { id: number; name: string; color: string };
type DataPoint = Record<string, number | string>;

interface Props {
  categories: Category[];
  data: DataPoint[];
}

export default function StatsCards({ categories, data }: Props) {
  const latest = data[data.length - 1] ?? {};

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {categories.map((cat) => {
        const val = (latest[cat.name] as number) ?? 0;
        const active = val > 0;
        return (
          <div
            key={cat.id}
            className="rounded-none p-4 transition-all"
            style={{
              background: "var(--bg-card)",
              border: `1px solid ${active ? cat.color + "55" : "var(--green-border)"}`,
              boxShadow: active ? `0 0 12px ${cat.color}18` : "none",
            }}
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
            <p className="text-xs mt-1 tracking-widest" style={{ color: "var(--green-border)" }}>
              /30D
            </p>
          </div>
        );
      })}
    </div>
  );
}
