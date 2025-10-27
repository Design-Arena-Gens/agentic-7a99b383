export type Coin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
};

export type Holding = {
  id: string; // CoinGecko ID
  symbol: string;
  name: string;
  amount: number;
};

export type PriceInfo = {
  price: number;
  change24hPercentage: number; // in percent, e.g., -2.5
};

export type PriceMap = Record<string, PriceInfo>;

export type PortfolioHistoryPoint = {
  timestamp: number; // ms epoch
  value: number; // USD
};
