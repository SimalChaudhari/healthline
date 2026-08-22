import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';

const DiaryContext = createContext(null);

const todayKey = () => new Date().toISOString().slice(0, 10);

function emptyMeals() {
  return { breakfast: [], lunch: [], dinner: [], snacks: [] };
}

const SEED = {
  breakfast: [
    {
      logId: 'seed-1',
      foodId: 'f4',
      name: 'Avocado Toast',
      serving: '1 slice',
      calories: 290,
      carbs: 28,
      protein: 8,
      fat: 16,
    },
  ],
  lunch: [
    {
      logId: 'seed-2',
      foodId: 'f7',
      name: 'Quinoa Salad',
      serving: '1 bowl',
      calories: 380,
      carbs: 48,
      protein: 14,
      fat: 14,
    },
  ],
  dinner: [],
  snacks: [
    {
      logId: 'seed-3',
      foodId: 'f9',
      name: 'Protein Shake',
      serving: '1 scoop + water',
      calories: 140,
      carbs: 4,
      protein: 25,
      fat: 2,
    },
  ],
};

export function DiaryProvider({ children }) {
  const [dateKey, setDateKey] = useState(todayKey);
  const [meals, setMeals] = useState(SEED);
  const [exercise, setExercise] = useState([
    { logId: 'ex-1', name: 'Walk', minutes: 32, calories: 140 },
  ]);
  const [goal, setGoal] = useState('lose');
  const [profile] = useState({
    name: 'Alex',
    calories: 2200,
    carbs: 220,
    protein: 140,
    fat: 73,
    waterGoal: 8,
    weight: 72.4,
    goalWeight: 68,
  });
  const [water, setWater] = useState(4);

  useEffect(() => {
    setWater((w) => (w > profile.waterGoal ? profile.waterGoal : w));
  }, [profile.waterGoal]);

  const totals = useMemo(() => {
    const all = [...meals.breakfast, ...meals.lunch, ...meals.dinner, ...meals.snacks];
    return all.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        carbs: acc.carbs + item.carbs,
        protein: acc.protein + item.protein,
        fat: acc.fat + item.fat,
      }),
      { calories: 0, carbs: 0, protein: 0, fat: 0 },
    );
  }, [meals]);

  const burned = useMemo(
    () => exercise.reduce((sum, item) => sum + item.calories, 0),
    [exercise],
  );

  const remaining = profile.calories - totals.calories + burned;

  const addFood = useCallback((meal, food) => {
    const entry = {
      logId: `log-${Date.now()}`,
      foodId: food.id || food.foodId,
      name: food.name,
      serving: food.serving,
      calories: food.calories,
      carbs: food.carbs,
      protein: food.protein,
      fat: food.fat,
    };
    setMeals((prev) => ({
      ...prev,
      [meal]: [...(prev[meal] || []), entry],
    }));
  }, []);

  const removeFood = useCallback((meal, logId) => {
    setMeals((prev) => ({
      ...prev,
      [meal]: (prev[meal] || []).filter((item) => item.logId !== logId),
    }));
  }, []);

  const addExercise = useCallback((item) => {
    setExercise((prev) => [
      ...prev,
      { logId: `ex-${Date.now()}`, ...item },
    ]);
  }, []);

  const addWater = useCallback(() => {
    setWater((n) => Math.min(n + 1, profile.waterGoal));
  }, [profile.waterGoal]);

  const resetWater = useCallback(() => setWater(0), []);

  const resetDay = useCallback(() => {
    setMeals(emptyMeals());
    setExercise([]);
    setWater(0);
  }, []);

  const value = {
    dateKey,
    setDateKey,
    meals,
    exercise,
    water,
    goal,
    setGoal,
    profile,
    totals,
    burned,
    remaining,
    addFood,
    removeFood,
    addExercise,
    addWater,
    resetWater,
    resetDay,
  };

  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
}

export function useDiary() {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error('useDiary must be used within DiaryProvider');
  return ctx;
}
