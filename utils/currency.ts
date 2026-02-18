import { PAYMENT_CONFIG } from '@/constants/Config';

/**
 * Formats a number as a currency string based on app config
 * @param amount - The amount to format
 * @param includeSymbol - Whether to include the currency symbol (default: true)
 * @returns Formatted string (e.g. "$5.99" or "5,99 €")
 */
export const formatCurrency = (
  amount: number,
  includeSymbol: boolean = true
): string => {
  const { currency, currencySymbol } = PAYMENT_CONFIG;

  // Basic formatting based on currency code
  // This can be expanded to use Intl.NumberFormat for better locale support
  let formatted = amount.toFixed(2);

  // Replace dot with comma for European currencies if preferred,
  // but keeping simple for now unless specific locale requested.
  // Standard Intl approach is better:
  try {
    return new Intl.NumberFormat(undefined, {
      style: includeSymbol ? 'currency' : 'decimal',
      currency: currency,
    }).format(amount);
  } catch (e) {
    // Fallback if Intl fails or currency code is invalid
    if (!includeSymbol) return formatted;
    return currency === 'EUR'
      ? `${formatted} ${currencySymbol}` // 5.99 €
      : `${currencySymbol}${formatted}`; // $5.99
  }
};

/**
 * Gets the configured currency symbol
 */
export const getCurrencySymbol = (): string => {
  return PAYMENT_CONFIG.currencySymbol;
};
