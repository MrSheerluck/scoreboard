"use client";

import { useState, useTransition } from "react";

type Category = { id: number; name: string; color: string };
interface Props { categories: Category[]; onLogged: () => void; }

function today() { return new Date().toISOString().slice(0, 10); }

export default function LogForm({ categories, onLogged }: Props) {
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id?.toString() ?? "");
  const [hours, setHours] = useState("");
  const [date, setDate] = useState(today());
  const [newCat, setNewCat] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function submitEntry(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setOk(false);
    const h = parseFloat(hours);
    if (!categoryId || isNaN(h) || h <= 0) { setError("ERR: INVALID INPUT"); return; }
    startTransition(async () => {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: parseInt(categoryId), hours: h, date }),
      });
      if (!res.ok) { setError("ERR: WRITE FAILED"); return; }
      setHours(""); setDate(today()); setOk(true);
      setTimeout(() => setOk(false), 2000);
      onLogged();
    });
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCat.trim()) return;
    startTransition(async () => {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCat.trim() }),
      });
      if (res.ok) {
        const cat: Category = await res.json();
        setCategoryId(cat.id.toString());
        setNewCat(""); setShowAddCat(false);
        onLogged();
      }
    });
  }

  const inputCls = "m-input w-full rounded-none px-3 py-2 text-sm";

  return (
    <div className="m-card rounded-none p-4">
      <p className="text-xs tracking-widest mb-4" style={{ color: "var(--green-dim)" }}>
        &gt; LOG HOURS
      </p>

      <form onSubmit={submitEntry} className="space-y-3">
        <div className="flex gap-2">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputCls + " flex-1"}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowAddCat(v => !v)}
            className="px-3 py-2 text-sm transition-colors"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--green-border)",
              color: "var(--green-dim)",
            }}
            title="New category"
          >
            +
          </button>
        </div>

        {showAddCat && (
          <form onSubmit={addCategory} className="flex gap-2">
            <input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="CATEGORY NAME"
              className={inputCls + " flex-1"}
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-2 text-xs tracking-widest transition-colors"
              style={{
                background: "var(--green-muted)",
                border: "1px solid var(--green-dim)",
                color: "var(--green)",
              }}
            >
              ADD
            </button>
          </form>
        )}

        <input
          type="date"
          value={date}
          max={today()}
          onChange={(e) => setDate(e.target.value)}
          className={inputCls}
        />

        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="HOURS  (e.g. 1.5)"
          min="0.1"
          step="0.1"
          className={inputCls}
        />

        {error && (
          <p className="text-xs tracking-widest" style={{ color: "#ff4141" }}>{error}</p>
        )}
        {ok && (
          <p className="text-xs tracking-widest glow" style={{ color: "var(--green)" }}>
            OK — ENTRY COMMITTED
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 text-sm tracking-widest font-bold transition-all"
          style={{
            background: isPending ? "var(--green-muted)" : "transparent",
            border: "1px solid var(--green-dim)",
            color: isPending ? "var(--green-muted)" : "var(--green)",
            boxShadow: isPending ? "none" : "inset 0 0 0 0 var(--green)",
          }}
          onMouseEnter={(e) => {
            if (!isPending) {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--green-muted)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 12px rgba(0,255,65,0.2)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          }}
        >
          {isPending ? "WRITING..." : "> COMMIT ENTRY"}
        </button>
      </form>
    </div>
  );
}
