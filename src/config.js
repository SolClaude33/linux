function readPublicValue(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readHttpsUrl(value) {
  const normalizedValue = readPublicValue(value);
  if (!normalizedValue) return null;
  try {
    const url = new URL(normalizedValue);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

export const projectConfig = Object.freeze({
  xUrl: readHttpsUrl(import.meta.env.VITE_X_URL),
  token: Object.freeze({
    network: 'Solana',
    ticker: readPublicValue(import.meta.env.VITE_TOKEN_TICKER),
    contractAddress: readPublicValue(import.meta.env.VITE_TOKEN_CA),
    buyUrl: readHttpsUrl(import.meta.env.VITE_BUY_URL),
  }),
});
