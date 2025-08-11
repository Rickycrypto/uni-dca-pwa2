
// Basic helpers for quotes and BTC sentiment.
// In production, replace with Uniswap QuoterV2 (read) and Universal Router calldata (write).

type Settings = any

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getBtcSentiment() {
  // Simple BTC signal using CoinGecko market chart (last 24h)
  // NOTE: No API key required; for production use a reliable provider with rate limits handled.
  const url = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1&interval=hourly'
  const data = await fetchJson(url)
  const prices: [number, number][] = data?.prices || []
  if (prices.length < 2) return { slopePct: 0, bias: 0 }
  const first = prices[0][1]
  const last = prices[prices.length - 1][1]
  const slopePct = ((last - first) / first) * 100
  // Bias: clip into [-1,1] roughly mapping -3%..+3%
  const bias = Math.max(-1, Math.min(1, slopePct / 3))
  return { slopePct, bias }
}

export async function quoteUniExactIn(amountUsd: number, settings: Settings) {
  const btc = await getBtcSentiment()
  // Adjust aggressiveness: if BTC trending up, we may be slightly more aggressive (+10% size),
  // if down, slightly less (-10% size)
  const adj = 1 + (btc.bias * 0.1)
  const eff = amountUsd * adj

  const human = [
    `BTC 24h slope: ${btc.slopePct.toFixed(2)}% (bias ${btc.bias.toFixed(2)})`,
    `Base order $${amountUsd.toFixed(2)} → adjusted $${eff.toFixed(2)}`,
    `Target weekly: ${settings.targetWeeklyPct}% | TP: ${settings.takeProfitPct}%`,
    `Max unrealized drawdown allowed: ${settings.maxUnrealizedDrawdownPct}% (no auto-sell)`,
    `Max realized loss on exit: ${settings.maxRealizedLossPct}%`
  ].join('\n')
  return { human, adjustedAmountUsd: eff }
}

export async function executeSwapUniversalRouter(amountUsd: number, settings: Settings) {
  // Placeholder swap: add logic to 1) ensure allowance (Permit2), 2) build calldata for Universal Router, 3) send tx.
  // For now, just return a dummy tx hash.
  return { txHash: '0xDUMMY_TX_HASH' }
}
