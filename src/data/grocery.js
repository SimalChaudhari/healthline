/** Grocery list for the weekly meal plan. */
export const GROCERY_SECTIONS = [
  {
    aisle: 'Produce',
    items: [
      { id: 'g1', name: 'Avocados', qty: '3' },
      { id: 'g2', name: 'Mixed berries', qty: '2 punnets' },
      { id: 'g3', name: 'Spinach', qty: '1 bag' },
      { id: 'g4', name: 'Broccoli', qty: '2 heads' },
      { id: 'g5', name: 'Salad greens', qty: '1 bag' },
      { id: 'g6', name: 'Apples', qty: '4' },
      { id: 'g7', name: 'Pears', qty: '3' },
    ],
  },
  {
    aisle: 'Protein',
    items: [
      { id: 'g8', name: 'Eggs', qty: '12' },
      { id: 'g9', name: 'Chicken breast', qty: '800 g' },
      { id: 'g10', name: 'Salmon fillets', qty: '2' },
      { id: 'g11', name: 'Tofu, firm', qty: '400 g' },
      { id: 'g12', name: 'Tuna in water', qty: '2 cans' },
      { id: 'g13', name: 'Greek yoghurt', qty: '500 g' },
      { id: 'g14', name: 'Cottage cheese', qty: '1 tub' },
    ],
  },
  {
    aisle: 'Pantry',
    items: [
      { id: 'g15', name: 'Rolled oats', qty: '1 bag' },
      { id: 'g16', name: 'Brown rice', qty: '1 kg' },
      { id: 'g17', name: 'Sourdough loaf', qty: '1' },
      { id: 'g18', name: 'Lentils, dried', qty: '500 g' },
      { id: 'g19', name: 'Peanut butter', qty: '1 jar' },
      { id: 'g20', name: 'Mixed nuts', qty: '200 g' },
      { id: 'g21', name: 'Olive oil', qty: '1 bottle' },
    ],
  },
  {
    aisle: 'Dairy & extras',
    items: [
      { id: 'g22', name: 'Milk or oat milk', qty: '1 L' },
      { id: 'g23', name: 'Dark chocolate', qty: '1 bar' },
      { id: 'g24', name: 'Almonds', qty: '150 g' },
    ],
  },
];

export function countGroceryItems() {
  return GROCERY_SECTIONS.reduce((n, s) => n + s.items.length, 0);
}
