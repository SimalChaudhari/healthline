/**
 * Universal packaged-food barcode lookup.
 * 1. Open Food Facts (nutrition) — tries EAN/UPC variants
 * 2. UPCitemdb (name/brand for groceries) + optional AI nutrition estimate
 */

import { parseFoodFromText, hasAiKey } from './aiService';
import { decodeBarcodeFromImageUri } from '../utils/decodeBarcodeImage';

const OFF_V2 = 'https://world.openfoodfacts.org/api/v2/product';
const OFF_V0 = 'https://world.openfoodfacts.org/api/v0/product';
const UPC_TRIAL = 'https://api.upcitemdb.com/prod/trial/lookup';

const USER_AGENT = 'HealthlineNutrition/1.0 (Health line; Expo; local-demo)';

export const BARCODE_SCAN_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'];

const FOOD_CATEGORY =
  /food|grocery|gourmet|beverage|drink|snack|nutrition|cookie|biscuit|chocolate|cereal|dairy|meat|produce|fruit|vegetable|spice|sauce|condiment|coffee|tea|juice|water|beer|wine|oil|candy|chips|cracker|pasta|rice|flour|sugar|salt|pepper|organic|halal|kosher|breakfast|lunch|dinner|meal|edible|eat|barcode food/i;

const OFF_FIELDS = [
  'code',
  'product_name',
  'product_name_en',
  'generic_name',
  'generic_name_en',
  'brands',
  'brand_owner',
  'serving_size',
  'quantity',
  'nutriments',
  'image_front_url',
  'image_url',
  'categories',
].join(',');

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Strip spaces/dashes and build GTIN variants (UPC-A ↔ EAN-13). */
export function normalizeBarcodeVariants(code) {
  const digits = String(code || '').replace(/\D/g, '');
  if (!digits) return [];

  const variants = new Set([digits]);

  if (digits.length === 12) {
    variants.add(`0${digits}`);
  }
  if (digits.length === 13 && digits.startsWith('0')) {
    variants.add(digits.slice(1));
  }
  if (digits.length === 8) {
    variants.add(digits.padStart(13, '0'));
  }
  if (digits.length < 13) {
    variants.add(digits.padStart(13, '0'));
  }

  return [...variants];
}

function pickName(product) {
  return (
    product.product_name ||
    product.product_name_en ||
    product.generic_name_en ||
    product.generic_name ||
    'Scanned product'
  ).trim();
}

function pickBrand(product) {
  const raw = product.brands || product.brand_owner || '';
  return raw.split(',')[0].trim() || 'Unknown brand';
}

function pickServing(product, nutriments) {
  if (product.serving_size) return String(product.serving_size).trim();
  if (nutriments['energy-kcal_serving'] != null) return '1 serving';
  return '100 g';
}

function isFoodCategory(text) {
  return FOOD_CATEGORY.test(String(text || ''));
}

/** Map Open Food Facts product → app food shape (per serving when available). */
export function mapOpenFoodFactsProduct(code, product) {
  const n = product.nutriments || {};
  const hasServing = n['energy-kcal_serving'] != null || n.carbohydrates_serving != null;

  const calories = Math.round(
    num(hasServing ? n['energy-kcal_serving'] : n['energy-kcal_100g'] ?? n['energy-kcal']),
  );
  const carbs = Math.round(num(hasServing ? n.carbohydrates_serving : n.carbohydrates_100g));
  const protein = Math.round(num(hasServing ? n.proteins_serving : n.proteins_100g));
  const fat = Math.round(num(hasServing ? n.fat_serving : n.fat_100g));

  const serving = pickServing(product, n);
  const quantity = product.quantity ? String(product.quantity).trim() : '';

  return {
    id: `off-${code}`,
    name: pickName(product),
    brand: pickBrand(product),
    barcode: code,
    serving: quantity && !serving.includes(quantity) ? `${serving} · ${quantity}` : serving,
    calories,
    carbs,
    protein,
    fat,
    tags: ['barcode', 'open-food-facts'],
    source: 'openfoodfacts',
    imageUrl: product.image_front_url || product.image_url || null,
  };
}

function mapUpcItem(item, code) {
  const title = String(item.title || '').trim() || 'Packaged food';
  const brand = String(item.brand || '').trim() || 'Grocery brand';
  const category = String(item.category || '').trim();

  return {
    id: `upc-${code}`,
    name: title,
    brand,
    barcode: code,
    serving: item.size || item.weight || '1 package',
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    tags: ['barcode', 'upc-lookup'],
    source: 'upcitemdb',
    imageUrl: item.images?.[0] || null,
    category,
    needsNutrition: true,
  };
}

async function fetchOffV2(code) {
  const url = `${OFF_V2}/${encodeURIComponent(code)}.json?fields=${OFF_FIELDS}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (json.status !== 1 || !json.product) return null;
  return mapOpenFoodFactsProduct(code, json.product);
}

async function fetchOffV0(code) {
  const url = `${OFF_V0}/${encodeURIComponent(code)}.json`;
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (json.status !== 1 || !json.product) return null;
  return mapOpenFoodFactsProduct(code, json.product);
}

async function lookupOpenFoodFacts(variants) {
  for (const code of variants) {
    const v2 = await fetchOffV2(code);
    if (v2?.calories > 0 || v2?.name) return v2;
  }
  for (const code of variants) {
    const v0 = await fetchOffV0(code);
    if (v0?.calories > 0 || v0?.name) return v0;
  }
  return null;
}

async function lookupUpcItemDb(code) {
  const url = `${UPC_TRIAL}?upc=${encodeURIComponent(code)}`;
  let res;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch {
    return null;
  }
  if (!res.ok) return null;

  const json = await res.json();
  const item = json?.items?.[0];
  if (!item) return null;

  const category = item.category || '';
  const title = item.title || '';
  if (!isFoodCategory(category) && !isFoodCategory(title)) {
    return null;
  }

  return mapUpcItem(item, code);
}

async function enrichWithAi(food) {
  if (!hasAiKey() || !food.needsNutrition) return food;

  try {
    const prompt = [
      `Packaged grocery product barcode ${food.barcode}.`,
      `Name: ${food.name}.`,
      food.brand ? `Brand: ${food.brand}.` : '',
      'Return realistic nutrition for one typical serving of this edible product.',
    ]
      .filter(Boolean)
      .join(' ');

    const { items } = await parseFoodFromText(prompt);
    const item = items?.[0];
    if (!item) return food;

    return {
      ...food,
      calories: item.calories,
      carbs: item.carbs,
      protein: item.protein,
      fat: item.fat,
      serving: item.serving || food.serving,
      tags: [...food.tags.filter((t) => t !== 'upc-lookup'), 'barcode', 'ai-estimated'],
      source: 'upcitemdb+ai',
      needsNutrition: false,
    };
  } catch {
    return food;
  }
}

/**
 * Look up any packaged food barcode (global groceries, snacks, drinks, etc.).
 */
export async function lookupBarcode(code) {
  const variants = normalizeBarcodeVariants(code);
  if (!variants.length) throw new Error('Invalid barcode');

  const primary = variants[0];

  const off = await lookupOpenFoodFacts(variants);
  if (off && (off.calories > 0 || off.name !== 'Scanned product')) {
    return off;
  }

  for (const variant of variants) {
    const upc = await lookupUpcItemDb(variant);
    if (upc) {
      const enriched = await enrichWithAi(upc);
      if (enriched.calories > 0) return enriched;
      if (enriched.name && enriched.name !== 'Packaged food') {
        return {
          ...enriched,
          calories: enriched.calories || 100,
          tags: [...enriched.tags, 'review-nutrition'],
        };
      }
    }
  }

  throw new Error(
    `No edible product found for ${primary}. Works best on packaged food barcodes (EAN/UPC). For fresh items without a barcode, use AI scan or add manually.`,
  );
}

export async function scanBarcodeFromImageUri(uri) {
  return decodeBarcodeFromImageUri(uri);
}
