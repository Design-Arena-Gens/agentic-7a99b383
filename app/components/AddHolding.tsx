"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Coin, Holding } from "@/app/lib/types";

type Props = {
  onAdd: (holding: Holding) => void;
};

export default function AddHolding({ onAdd }: Props) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [selected, setSelected] = useState<Coin | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/coins")
      .then((r) => r.json())
      .then((data: Coin[]) => {
        if (mounted) setCoins(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coins.slice(0, 12);
    return coins
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [coins, query]);

  function handleSelect(c: Coin) {
    setSelected(c);
    setQuery(`${c.name} (${c.symbol})`);
  }

  function handleAdd() {
    if (!selected) return;
    const amt = Number(amount);
    if (!isFinite(amt) || amt <= 0) return;
    onAdd({ id: selected.id, symbol: selected.symbol, name: selected.name, amount: amt });
    setSelected(null);
    setQuery("");
    setAmount("");
  }

  return (
    <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Coin</label>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            placeholder={loading ? "Loading coins..." : "Search name or symbol"}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
          />
          {filtered.length > 0 && !selected && (
            <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className="flex w-full items-center gap-3 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt={c.symbol} className="h-5 w-5 rounded-full" />
                  <span className="font-medium">{c.name}</span>
                  <span className="text-xs text-zinc-500">{c.symbol}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="w-full md:w-40">
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            type="number"
            min="0"
            step="any"
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <button
          onClick={handleAdd}
          className="h-10 md:h-[42px] rounded-lg bg-black text-white px-4 font-medium hover:bg-zinc-800 disabled:opacity-50"
          disabled={!selected || !amount}
        >
          Add Holding
        </button>
      </div>
    </div>
  );
}
