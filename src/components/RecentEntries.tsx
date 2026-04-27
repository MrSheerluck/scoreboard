"use client";

import { useState, useTransition } from "react";
import { format, parseISO } from "date-fns";

type Entry = { id: number; category: string; color: string; hours: number; date: string; description?: string };
interface Props { entries: Entry[]; onDelete: () => void; }

const PAGE_SIZE = 8;

export default function RecentEntries({ entries, onDelete }: Props) {
  const [page, setPage] = useState(0);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const slice = entries.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleDelete(id: number) {
    startTransition(async () => {
      await fetch(`/api/entries?id=${id}`, { method: "DELETE" });
      // If we deleted the last item on a non-first page, go back one
      const newTotal = entries.length - 1;
      const newTotalPages = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
      if (page >= newTotalPages) setPage(newTotalPages - 1);
      onDelete();
    });
  }

  if (!entries.length) {
    return (
      <p className="text-xs tracking-widest text-center py-6" style={{ color: "var(--green-muted)" }}>
        NO ENTRIES FOUND
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Entry rows */}
      <div className="space-y-0.5">
        {slice.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between px-2 py-1.5 group transition-colors"
            style={{ borderBottom: "1px solid var(--green-border)" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: entry.color, boxShadow: `0 0 4px ${entry.color}` }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs tracking-wider" style={{ color: "var(--green-dim)" }}>
                    {entry.category.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold tabular-nums" style={{ color: "var(--green)" }}>
                    {entry.hours.toFixed(1)}H
                  </span>
                </div>
                {entry.description && (
                  <p className="text-xs truncate mt-0.5" style={{ color: "var(--green-muted)" }}>
                    {entry.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs" style={{ color: "var(--green-muted)" }}>
                {format(parseISO(entry.date), "MMM dd")}
              </span>
              <button
                onClick={() => handleDelete(entry.id)}
                disabled={isPending}
                className="opacity-0 group-hover:opacity-100 text-xs w-4 text-center transition-opacity"
                style={{ color: "#ff4141" }}
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-xs px-2 py-1 tracking-widest transition-colors disabled:opacity-25"
            style={{
              border: "1px solid var(--green-border)",
              color: "var(--green-dim)",
              background: "transparent",
            }}
          >
            &lt; PREV
          </button>
          <span className="text-xs tracking-widest" style={{ color: "var(--green-muted)" }}>
            {String(page + 1).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="text-xs px-2 py-1 tracking-widest transition-colors disabled:opacity-25"
            style={{
              border: "1px solid var(--green-border)",
              color: "var(--green-dim)",
              background: "transparent",
            }}
          >
            NEXT &gt;
          </button>
        </div>
      )}
    </div>
  );
}
