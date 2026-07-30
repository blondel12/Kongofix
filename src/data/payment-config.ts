/**
 * KongoFix — Configuration des méthodes de paiement
 *
 * Trois moyens de paiement disponibles :
 * - Airtel Money (mobile money, Congo)
 * - MTN Mobile Money (mobile money, Congo)
 * - Espèces (paiement en liquide après intervention)
 */
const airtelNumber = process.env.VITE_AIRTEL_MONEY_NUMBER || "+242 05 553 78 91";
const mtnNumber = process.env.VITE_MTN_MONEY_NUMBER || "+242 06 543 18 06";

export const METHODS: Record<string, string> = {
  airtel_money: `Airtel Money (${airtelNumber})`,
  mtn_money: `MTN Mobile Money (${mtnNumber})`,
  cash: "Espèces (après intervention)",
};

export const KONGOFIX_NUMBERS = {
  airtel_money: process.env.VITE_AIRTEL_MONEY_NUMBER || "+242 05 553 78 91",
  mtn_money: process.env.VITE_MTN_MONEY_NUMBER || "+242 06 543 18 06",
};

export const KONGOFIX_NAME = "KongoFix SARL";
