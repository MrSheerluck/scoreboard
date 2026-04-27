"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

type Category = { id: number; name: string; color: string };
type DataPoint = Record<string, number | string>;
interface Props { categories: Category[]; data: DataPoint[] }

function CustomTooltip({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0);
  return (
    <div
      className="p-3 text-xs"
      style={{
        background: "#000",
        border: "1px solid #1a3a1a",
        boxShadow: "0 0 16px rgba(0,255,65,0.15)",
        minWidth: "160px",
      }}
    >
      <p className="tracking-widest mb-2" style={{ color: "#005500" }}>
        {label ? format(parseISO(label), "dd MMM yyyy").toUpperCase() : ""}
      </p>
      {[...payload].reverse().map((p) => (
        <div key={p.name} className="flex justify-between gap-4 mb-0.5">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: p.color, boxShadow: `0 0 4px ${p.color}` }} />
            <span style={{ color: "#00cc33" }}>{p.name.toUpperCase()}</span>
          </span>
          <span className="font-bold tabular-nums" style={{ color: p.color, textShadow: `0 0 8px ${p.color}88` }}>
            {p.value.toFixed(1)}H
          </span>
        </div>
      ))}
      <div className="flex justify-between pt-1.5 mt-1" style={{ borderTop: "1px solid #1a3a1a" }}>
        <span style={{ color: "#005500" }}>TOTAL</span>
        <span className="font-bold tabular-nums" style={{ color: "#00ff41", textShadow: "0 0 8px rgba(0,255,65,0.5)" }}>
          {total.toFixed(1)}H
        </span>
      </div>
    </div>
  );
}

function CustomLegend({ payload }: { payload?: { value: string; color: string }[] }) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 justify-center mt-3">
      {payload.map((p) => (
        <span key={p.value} className="flex items-center gap-1.5 text-xs tracking-widest">
          <span className="w-2 h-0.5 inline-block" style={{ background: p.color, boxShadow: `0 0 4px ${p.color}` }} />
          <span style={{ color: "#00cc33" }}>{p.value.toUpperCase()}</span>
        </span>
      ))}
    </div>
  );
}

export default function MomentumChart({ categories, data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-xs tracking-widest" style={{ color: "#003b00" }}>
        NO DATA — LOG HOURS TO INITIALIZE
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={360}>
      <AreaChart data={data} margin={{ top: 10, right: 5, left: 0, bottom: 0 }}>
        <defs>
          {categories.map((cat) => (
            <linearGradient key={cat.id} id={`grad-${cat.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={cat.color} stopOpacity={0.5} />
              <stop offset="95%" stopColor={cat.color} stopOpacity={0.05} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke="#0a200a" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => format(parseISO(d), "MMM d").toUpperCase()}
          tick={{ fill: "#003b00", fontSize: 10, fontFamily: "inherit" }}
          axisLine={{ stroke: "#1a3a1a" }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#003b00", fontSize: 10, fontFamily: "inherit" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}H`}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
        {categories.map((cat) => (
          <Area
            key={cat.id}
            type="monotone"
            dataKey={cat.name}
            stackId="1"
            stroke={cat.color}
            strokeWidth={1}
            fill={`url(#grad-${cat.id})`}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0, fill: cat.color }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
