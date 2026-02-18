/**
 * Promo code validation and discount calculation
 */

export interface PromoResult {
  valid: boolean;
  discountPercent?: number;
  discountFixed?: number;
  message: string;
}

// Demo promo codes (in production, fetch from DB)
const PROMOS: Record<string, { percent?: number; fixed?: number }> = {
  WELCOME10: { percent: 10 },
  SAVE20: { percent: 20 },
  FLAT50: { fixed: 50 },
  RIDE100: { fixed: 100 },
};

export function validatePromoCode(code: string): PromoResult {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) {
    return { valid: false, message: "Enter a promo code" };
  }
  const promo = PROMOS[trimmed];
  if (!promo) {
    return { valid: false, message: "Invalid promo code" };
  }
  if (promo.percent) {
    return {
      valid: true,
      discountPercent: promo.percent,
      message: `${promo.percent}% off applied`,
    };
  }
  if (promo.fixed) {
    return {
      valid: true,
      discountFixed: promo.fixed,
      message: `₹${promo.fixed} off applied`,
    };
  }
  return { valid: false, message: "Invalid promo code" };
}

export function applyPromoDiscount(
  fare: number,
  promo: PromoResult
): { finalFare: number; discount: number } {
  if (!promo.valid) return { finalFare: fare, discount: 0 };
  let discount = 0;
  if (promo.discountPercent) {
    discount = Math.round((fare * promo.discountPercent) / 100);
  } else if (promo.discountFixed) {
    discount = Math.min(promo.discountFixed, fare);
  }
  return {
    finalFare: Math.max(0, fare - discount),
    discount,
  };
}
