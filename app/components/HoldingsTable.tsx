"use client";

import React, { useMemo } from "react";
import useSWR from "swr";
import type { Holding } from "@/app/lib/types";

const fetcher = (url: string, ids: string[]) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  }).then((r) => r.json());

type Props = {
  holdings: Holding[];
  onRemove: (id: string) => void;
};

export default function HoldingsTable({ holdings, onRemove }: Props) {
  const ids = useMemo(() => Array.from(new Set(holdings.map((h) => h.id))), [
    holdings,
  ]);

  const { data: prices } = useSWR(
    ids.length ? ["/api/price", ids] : null,
    ([url, ids]) => fetcher(url as string, ids as string[]),
    { refreshInterval: 30_000 }
  );

  const rows = holdings.map((h) => {
    const info = prices?.[h.id];
    const price = Number(info?.price ?? 0);
    const changePct = Number(info?.change24hPercentage ?? 0);
    const value = h.amount * price;
    return { ...h, price, changePct, value };
  });

  const total = rows.reduce((sum, r) => sum + r.value, 0);
  const weightedChangePct = useMemo(() => {
    if (!total) return 0;
    const sum = rows.reduce((acc, r) => acc + (r.value * r.changePct) / 100, 0);
    return (sum / total) * 100;
  }, [rows, total]);

  return (
    <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="text-sm text-zinc-500">Total Portfolio Value</div>
          <div className="text-2xl font-semibold">${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${weightedChangePct >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {weightedChangePct >= 0 ? "+" : ""}{weightedChangePct.toFixed(2)}% 24h
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300">
            <tr>
              <th className="text-left px-4 py-2">Asset</th>
              <th className="text-right px-4 py-2">Amount</th>
              <th className="text-right px-4 py-2">Price</th>
              <th className="text-right px-4 py-2">Value</th>
              <th className="text-right px-4 py-2">24h</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-3">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-zinc-500">{r.symbol}</div>
                </td>
                <td className="px-4 py-3 text-right">{r.amount}</td>
                <td className="px-4 py-3 text-right">${r.price.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                <td className="px-4 py-3 text-right">${r.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className={`px-4 py-3 text-right ${r.changePct >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {r.changePct >= 0 ? "+" : ""}{r.changePct.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onRemove(r.id)} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">Remove</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No holdings yet. Add your first asset above.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
