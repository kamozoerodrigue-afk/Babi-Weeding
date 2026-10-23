import { BUDGETS, VENDORS, type Vendor } from '@/data/catalogue';
import type { Filters } from '@/components/FiltersSheet';

/** Applique les filtres du panneau bas au catalogue. */
export function applyFilters(f: Filters): Vendor[] {
  const budget = BUDGETS.find((b) => b.id === f.budgetId) as
    | { min?: number; max?: number }
    | undefined;

  return VENDORS.filter((v) => {
    if (f.categoryId && v.categoryId !== f.categoryId) return false;
    if (f.cities.length && !f.cities.includes(v.commune)) return false;
    if (f.certifiedOnly && !v.certified) return false;
    if (f.minRating && v.rating < f.minRating) return false;
    if (budget?.min !== undefined && v.priceFrom < budget.min) return false;
    if (budget?.max !== undefined && v.priceFrom > budget.max) return false;
    return true;
  });
}
