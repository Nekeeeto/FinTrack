export function formatMoney(amount: number, currency: string = "UYU"): string {
  const prefix = currency === "USD" ? "US$" : "$"
  const formatted = Math.abs(amount).toLocaleString("es-UY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return amount < 0 ? `-${prefix}${formatted}` : `${prefix}${formatted}`
}

export function formatDate(date: string): string {
  return new Date(date + "T12:00:00").toLocaleDateString("es-UY", {
    day: "numeric",
    month: "short",
  })
}
