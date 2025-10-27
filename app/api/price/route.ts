import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
    if (!ids.length) {
      return NextResponse.json({}, { status: 200 });
    }

    const url = new URL("https://api.coingecko.com/api/v3/simple/price");
    url.searchParams.set("ids", ids.join(","));
    url.searchParams.set("vs_currencies", "usd");
    url.searchParams.set("include_24hr_change", "true");

    const res = await fetch(url.toString(), {
      next: { revalidate: 30 },
      headers: { accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch prices" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const result: Record<string, { price: number; change24hPercentage: number }> = {};
    for (const id of ids) {
      const entry = data[id];
      if (entry) {
        result[id] = {
          price: Number(entry.usd ?? 0),
          change24hPercentage: Number(entry.usd_24h_change ?? 0),
        };
      }
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
