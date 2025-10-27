"use client";

import React, { useEffect, useMemo, useState } from "react";
import AddHolding from "@/app/components/AddHolding";
import HoldingsTable from "@/app/components/HoldingsTable";
import PortfolioChart from "@/app/components/PortfolioChart";
import type { Holding } from "@/app/lib/types";

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    const raw = window.localStorage.getItem(key);
    if (!raw) return initial;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

export default function Home() {
  const [holdings, setHoldings] = useLocalStorage<Holding[]>("portfolio_holdings", []);
  const [days, setDays] = useState<number>(90);

  function addHolding(h: Holding) {
    setHoldings((cur) => {
      const existing = cur.find((x) => x.id === h.id);
      if (existing) {
        return cur.map((x) => (x.id === h.id ? { ...x, amount: x.amount + h.amount } : x));
      }
      return [...cur, h];
    });
  }

  function removeHolding(id: string) {
    setHoldings((cur) => cur.filter((x) => x.id !== id));
  }

  const nonZeroHoldings = useMemo(() => holdings.filter((h) => h.amount > 0), [holdings]);

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-black font-sans">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold">Crypto Portfolio Tracker</h1>
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => setDays(30)} className={`px-3 py-1 rounded-md border ${days===30?"bg-black text-white border-black":"border-zinc-300 dark:border-zinc-700"}`}>30D</button>
            <button onClick={() => setDays(90)} className={`px-3 py-1 rounded-md border ${days===90?"bg-black text-white border-black":"border-zinc-300 dark:border-zinc-700"}`}>90D</button>
            <button onClick={() => setDays(180)} className={`px-3 py-1 rounded-md border ${days===180?"bg-black text-white border-black":"border-zinc-300 dark:border-zinc-700"}`}>180D</button>
            <button onClick={() => setDays(365)} className={`px-3 py-1 rounded-md border ${days===365?"bg-black text-white border-black":"border-zinc-300 dark:border-zinc-700"}`}>1Y</button>
          </div>
        </header>

        <AddHolding onAdd={addHolding} />

        <HoldingsTable holdings={nonZeroHoldings} onRemove={removeHolding} />

        <PortfolioChart holdings={nonZeroHoldings} days={days} />
      </div>
    </div>
  );
}
