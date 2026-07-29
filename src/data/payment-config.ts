/**
 * KongoFix — Configuration des méthodes de paiement
 *
 * Trois moyens de paiement disponibles :
 * - Airtel Money (mobile money, Congo)
 * - MTN Mobile Money (mobile money, Congo)
 * - Espèces (paiement en liquide après intervention)
 */
export const METHODS: Record<string, string> = {
  airtel_money: "Airtel Money (+242 05 553 78 91)",
  mtn_money: "MTN Mobile Money (+242 06 543 18 06)",
  cash: "Espèces (après intervention)",
};

export const KONGOFIX_NUMBERS = {
  airtel_money: "+242 05 553 78 91",
  mtn_money: "+242 06 543 18 06",
};

export const KONGOFIX_NAME = "KongoFix SARL";
