import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 3600; // 1 hour

export async function GET() {
  const url = new URL(
    "https://api.coingecko.com/api/v3/coins/markets"
  );
  url.searchParams.set("vs_currency", "usd");
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", "250");
  url.searchParams.set("page", "1");
  url.searchParams.set("sparkline", "false");
  url.searchParams.set("price_change_percentage", "24h");

  const res = await fetch(url.toString(), {
    next: { revalidate },
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch coins" },
      { status: 502 }
    );
  }

  const data = await res.json();
  const coins = data.map((c: any) => ({
    id: c.id as string,
    symbol: (c.symbol as string)?.toUpperCase(),
    name: c.name as string,
    image: c.image as string,
  }));
  return NextResponse.json(coins);
}
