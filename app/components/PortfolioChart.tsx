"use client";

import React from "react";
import useSWR from "swr";
import type { Holding, PortfolioHistoryPoint } from "@/app/lib/types";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Filler);

const fetcher = (url: string, payload: any) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => r.json());

type Props = {
  holdings: Holding[];
  days?: number;
};

export default function PortfolioChart({ holdings, days = 90 }: Props) {
  const { data } = useSWR(
    holdings.length ? ["/api/history", { holdings: holdings.map(h => ({ id: h.id, amount: h.amount })), days }] : null,
    ([url, payload]) => fetcher(url as string, payload),
    { refreshInterval: 60_000 }
  );

  const points: PortfolioHistoryPoint[] = data?.points ?? [];

  const chartData = {
    labels: points.map((p) => new Date(p.timestamp)),
    datasets: [
      {
        label: "Portfolio Value (USD)",
        data: points.map((p) => p.value),
        borderColor: "#18181b",
        backgroundColor: "rgba(24,24,27,0.08)",
        fill: true,
        pointRadius: 0,
        tension: 0.25,
      },
    ],
  };

  const options: any = {
    responsive: true,
    scales: {
      x: {
        type: "time",
        time: { unit: days <= 7 ? "hour" : days <= 90 ? "day" : "month" },
        grid: { display: false },
      },
      y: {
        ticks: {
          callback: (v: number) => "$" + Number(v).toLocaleString(),
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `$${Number(ctx.parsed.y).toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
      {points.length ? (
        <Line data={chartData} options={options} height={120} />
      ) : (
        <div className="text-sm text-zinc-500 text-center py-16">Add holdings to see historical performance.</div>
      )}
    </div>
  );
}
