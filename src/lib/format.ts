const CURRENCY_CONFIG: Record<string, { prefix: string; locale: string }> = {
  UYU: { prefix: "$", locale: "es-UY" },
  USD: { prefix: "US$", locale: "es-UY" },
  BRL: { prefix: "R$", locale: "pt-BR" },
  ARS: { prefix: "AR$", locale: "es-AR" },
}

export function formatMoney(amount: number, currency: string = "UYU"): string {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.UYU
  const formatted = Math.abs(amount).toLocaleString(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return amount < 0 ? `-${config.prefix}${formatted}` : `${config.prefix}${formatted}`
}

export function formatDate(date: string): string {
  return new Date(date + "T12:00:00").toLocaleDateString("es-UY", {
    day: "numeric",
    month: "short",
  })
}
