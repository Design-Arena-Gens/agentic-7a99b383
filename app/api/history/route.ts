import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const holdings: Array<{ id: string; amount: number }> = Array.isArray(
      body?.holdings
    )
      ? body.holdings
      : [];
    const days = Math.max(1, Math.min(365, Number(body?.days ?? 90)));

    if (!holdings.length) {
      return NextResponse.json({ points: [] }, { status: 200 });
    }

    const vsCurrency = "usd";

    const histories = await Promise.all(
      holdings.map(async (h) => {
        const url = new URL(
          `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(
            h.id
          )}/market_chart`
        );
        url.searchParams.set("vs_currency", vsCurrency);
        url.searchParams.set("days", String(days));
        url.searchParams.set("interval", days > 90 ? "daily" : "hourly");

        const res = await fetch(url.toString(), {
          next: { revalidate: 600 },
          headers: { accept: "application/json" },
        });
        if (!res.ok) {
          return { id: h.id, amount: h.amount, prices: [] as Array<[number, number]> };
        }
        const data = await res.json();
        const prices: Array<[number, number]> = data?.prices ?? [];
        return { id: h.id, amount: h.amount, prices };
      })
    );

    const totalByTs = new Map<number, number>();

    for (const { amount, prices } of histories) {
      for (const [ts, price] of prices) {
        const prev = totalByTs.get(ts) ?? 0;
        totalByTs.set(ts, prev + amount * price);
      }
    }

    const points = Array.from(totalByTs.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([timestamp, value]) => ({ timestamp, value }));

    return NextResponse.json({ points });
  } catch (e) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
