export const formatCurrency = (
  amount: number | null | undefined,
  locale: string = "en-US",
  currency: string = "USD"
) => {
  if (amount == null) return "$0.00"; // Handle null or undefined cases

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
};
