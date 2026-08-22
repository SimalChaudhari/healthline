export const RECIPES = [
  {
    id: 'r1',
    title: 'Avocado Toast with Eggs',
    time: '12 min',
    calories: 420,
    tags: ['Breakfast', 'High protein'],
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=900&q=80',
    description: 'Creamy avocado on whole-grain toast topped with a runny egg — balanced fats, fiber, and protein to start your day.',
    nutrition: { carbs: 28, protein: 22, fat: 24 },
    ingredients: [
      '2 slices whole-grain bread',
      '1 ripe avocado',
      '2 eggs',
      '1 tsp olive oil',
      'Salt, pepper, chili flakes',
    ],
    steps: [
      'Toast bread until golden.',
      'Mash avocado with salt and pepper; spread on toast.',
      'Fry eggs in olive oil to your liking.',
      'Top toast with eggs and chili flakes. Serve warm.',
    ],
  },
  {
    id: 'r2',
    title: 'Greek Yogurt Berry Bowl',
    time: '5 min',
    calories: 280,
    tags: ['Breakfast', 'Quick'],
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=900&q=80',
    description: 'Thick Greek yogurt layered with mixed berries, honey, and crunchy granola.',
    nutrition: { carbs: 38, protein: 18, fat: 8 },
    ingredients: [
      '1 cup Greek yogurt (0%)',
      '1/2 cup mixed berries',
      '2 tbsp granola',
      '1 tsp honey',
    ],
    steps: [
      'Add yogurt to a bowl.',
      'Top with berries and granola.',
      'Drizzle honey and serve immediately.',
    ],
  },
  {
    id: 'r3',
    title: 'Grilled Salmon & Greens',
    time: '25 min',
    calories: 510,
    tags: ['Dinner', 'Low carb'],
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=900&q=80',
    description: 'Pan-seared salmon over lemon-dressed greens — high protein, omega-3s, and minimal carbs.',
    nutrition: { carbs: 12, protein: 42, fat: 32 },
    ingredients: [
      '180 g salmon fillet',
      '2 cups mixed greens',
      '1 tbsp olive oil',
      '1/2 lemon, juice',
      'Garlic, salt, pepper',
    ],
    steps: [
      'Season salmon; sear 4 min per side in olive oil.',
      'Toss greens with lemon juice, garlic, salt, and pepper.',
      'Plate greens, top with salmon, and serve.',
    ],
  },
  {
    id: 'r4',
    title: 'Rainbow Veggie Bowl',
    time: '20 min',
    calories: 390,
    tags: ['Lunch', 'Plant-based'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=80',
    description: 'Colorful roasted vegetables over quinoa with tahini drizzle — filling and fiber-rich.',
    nutrition: { carbs: 52, protein: 14, fat: 16 },
    ingredients: [
      '1 cup cooked quinoa',
      '1 cup roasted vegetables',
      '2 tbsp tahini',
      '1 tbsp lemon juice',
      'Fresh herbs',
    ],
    steps: [
      'Roast chopped vegetables at 200°C for 18 min.',
      'Warm quinoa and divide into bowls.',
      'Top with veggies; drizzle tahini and lemon.',
    ],
  },
  {
    id: 'r5',
    title: 'Berry Protein Smoothie',
    time: '6 min',
    calories: 240,
    tags: ['Snack', 'Quick'],
    image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=900&q=80',
    description: 'Blended berries, banana, and protein powder — a fast post-workout or afternoon snack.',
    nutrition: { carbs: 32, protein: 24, fat: 4 },
    ingredients: [
      '1 scoop vanilla protein',
      '1/2 cup frozen berries',
      '1/2 banana',
      '1 cup almond milk',
      'Ice cubes',
    ],
    steps: [
      'Add all ingredients to a blender.',
      'Blend until smooth, 30–45 seconds.',
      'Pour and enjoy cold.',
    ],
  },
  {
    id: 'r6',
    title: 'Chicken Quinoa Plate',
    time: '30 min',
    calories: 480,
    tags: ['Lunch', 'High protein'],
    image: 'https://images.unsplash.com/photo-1532550907401-a532c81cd57d?w=900&q=80',
    description: 'Grilled chicken breast with herbed quinoa and steamed broccoli — a classic meal-prep plate.',
    nutrition: { carbs: 44, protein: 38, fat: 14 },
    ingredients: [
      '150 g chicken breast',
      '3/4 cup cooked quinoa',
      '1 cup broccoli florets',
      '1 tsp olive oil',
      'Herbs, garlic, salt',
    ],
    steps: [
      'Grill seasoned chicken until cooked through.',
      'Steam broccoli 4–5 minutes.',
      'Serve chicken over quinoa with broccoli on the side.',
    ],
  },
];

export const RECIPE_FILTERS = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Quick', 'High protein', 'Low carb'];

export function getRecipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

export function mealFromRecipeTags(tags = []) {
  if (tags.includes('Breakfast')) return 'breakfast';
  if (tags.includes('Lunch')) return 'lunch';
  if (tags.includes('Dinner')) return 'dinner';
  if (tags.includes('Snack')) return 'snacks';
  return 'lunch';
}
