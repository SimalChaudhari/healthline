/** Weekly meal plan — adapted from Nourish example. */
export const DAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DAY_LABELS = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

/** [mealType, name, calories, protein, carbs, fat] */
export const MEAL_PLAN = {
  Mon: [
    ['Breakfast', 'Egg & avocado toast', 460, 24, 38, 22],
    ['Lunch', 'Lentil soup, sourdough', 540, 26, 72, 12],
    ['Dinner', 'Tofu stir-fry, rice', 600, 34, 68, 18],
    ['Snack', 'Cottage cheese, pear', 280, 28, 22, 8],
  ],
  Tue: [
    ['Breakfast', 'Protein pancakes', 520, 38, 54, 14],
    ['Lunch', 'Tuna niçoise', 480, 42, 24, 22],
    ['Dinner', 'Beef & broccoli, rice', 640, 46, 62, 20],
    ['Snack', 'Apple, peanut butter', 250, 8, 28, 12],
  ],
  Wed: [
    ['Breakfast', 'Overnight oats, berries', 418, 19, 62, 11],
    ['Lunch', 'Chicken caesar wrap', 610, 38, 54, 26],
    ['Dinner', 'Salmon, greens, potatoes', 620, 44, 44, 26],
    ['Snack', 'Greek yoghurt', 180, 20, 12, 4],
  ],
  Thu: [
    ['Breakfast', 'Overnight oats, berries', 418, 19, 62, 11],
    ['Lunch', 'Chicken caesar wrap', 610, 38, 54, 26],
    ['Dinner', 'Garlic chicken & spinach bowl', 520, 44, 46, 16],
    ['Snack', 'Greek yoghurt, almonds', 454, 71, 30, 15],
  ],
  Fri: [
    ['Breakfast', 'Egg & avocado toast', 460, 24, 38, 22],
    ['Lunch', 'Lentil soup, sourdough', 540, 26, 72, 12],
    ['Dinner', 'Tofu stir-fry, rice', 600, 34, 68, 18],
    ['Snack', 'Dark chocolate, 20 g', 110, 2, 9, 7],
  ],
  Sat: [
    ['Breakfast', 'Protein pancakes', 520, 38, 54, 14],
    ['Lunch', 'Leftover stir-fry', 430, 28, 48, 12],
    ['Dinner', 'Family pasta bake', 680, 42, 78, 22],
    ['Snack', 'Mixed nuts', 200, 7, 6, 17],
  ],
  Sun: [
    ['Breakfast', 'Shakshuka, sourdough', 540, 28, 44, 26],
    ['Lunch', 'Roast chicken salad', 520, 48, 26, 24],
    ['Dinner', 'Miso salmon, rice', 610, 42, 58, 20],
    ['Snack', 'Berries & yoghurt', 190, 16, 20, 4],
  ],
};

export function getTodayDayKey() {
  const dow = new Date().getDay();
  const map = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return map[dow];
}

export function parseMealRow(row) {
  const [mealType, name, calories, protein, carbs, fat] = row;
  return { mealType, name, calories, protein, carbs, fat };
}

export function getDayMeals(dayKey) {
  return (MEAL_PLAN[dayKey] || []).map(parseMealRow);
}

export function getDayTotals(dayKey) {
  const meals = getDayMeals(dayKey);
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
