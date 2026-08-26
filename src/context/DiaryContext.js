import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DIARY_STATE_KEY } from '../config/storageKeys';
import { GROCERY_SECTIONS } from '../data/grocery';
import { DAY_KEYS, getDayMeals } from '../data/mealPlan';
import { getFoodById } from '../data/foods';

const DiaryContext = createContext(null);

export const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

function emptyMeals() {
  return { breakfast: [], lunch: [], dinner: [], snacks: [] };
}

function emptyDay() {
  return { meals: emptyMeals(), exercise: [], water: 0 };
}

function toLogEntry(food, suffix) {
  return {
    logId: `demo-${food.id}-${suffix}`,
    foodId: food.id,
    name: food.name,
    serving: food.serving,
    calories: food.calories,
    carbs: food.carbs || 0,
    protein: food.protein || 0,
    fat: food.fat || 0,
    fiber: food.fiber || 0,
    sugar: food.sugar || 0,
    sodium: food.sodium || 0,
  };
}

/** Sample day so Home ring / macros show filled progress out of the box. */
function seedDemoDay() {
  const pick = (id, s) => {
    const food = getFoodById(id);
    if (!food) return null;
    return toLogEntry(food, s);
  };
  return {
    meals: {
      breakfast: [pick('f5', 'b1'), pick('f1', 'b2')].filter(Boolean),
      lunch: [pick('f6', 'l1'), pick('f7', 'l2')].filter(Boolean),
      dinner: [pick('f8', 'd1')].filter(Boolean),
      snacks: [pick('f9', 's1'), pick('f10', 's2')].filter(Boolean),
    },
    exercise: [
      {
        logId: 'demo-ex-walk',
        name: 'Brisk walk',
        minutes: 35,
        calories: 210,
      },
    ],
    water: 5,
  };
}

function dayHasFood(day) {
  if (!day?.meals) return false;
  return Object.values(day.meals).some((list) => Array.isArray(list) && list.length > 0);
}

function seedDays() {
  const key = todayKey();
  return { [key]: seedDemoDay() };
}

const DEFAULT_PROFILE = {
  name: 'Alex',
  firstName: '',
  lastName: '',
  sex: '',
  age: 30,
  heightCm: 168,
  activity: 'Moderate',
  calories: 2200,
  carbs: 220,
  protein: 140,
  fat: 73,
  waterGoal: 8,
  weight: 72.4,
  goalWeight: 68,
  diet: [],
  allergies: [],
  conditions: [],
  focusGoals: [],
};

const DEFAULT_REMINDERS = {
  breakfast: true,
  lunch: true,
  dinner: true,
  snack: false,
  water: true,
  exercise: false,
  weighIn: false,
  foodLog: false,
  mealPlan: false,
};

function seedGrocery() {
  return GROCERY_SECTIONS.flatMap((s) =>
    s.items.map((item) => ({
      ...item,
      aisle: s.aisle,
      checked: false,
    })),
  );
}

function seedMealPlan() {
  const out = {};
  DAY_KEYS.forEach((day) => {
    out[day] = getDayMeals(day).map((m, i) => ({
      id: `mp-${day}-${i}`,
      ...m,
    }));
  });
  return out;
}

const DEFAULT_STATE = {
  dateKey: todayKey(),
  days: seedDays(),
  goal: 'lose',
  profile: DEFAULT_PROFILE,
  weightLogs: [],
  favorites: [],
  recentFoods: [],
  customFoods: [],
  reminders: DEFAULT_REMINDERS,
  grocery: seedGrocery(),
  mealPlan: seedMealPlan(),
};

function dayOrEmpty(days, key) {
  return days[key] || emptyDay();
}

export function DiaryProvider({ children }) {
  const [hydrated, setHydrated] = useState(false);
  const [dateKey, setDateKeyState] = useState(DEFAULT_STATE.dateKey);
  const [days, setDays] = useState(() => seedDays());
  const [goal, setGoal] = useState('lose');
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [weightLogs, setWeightLogs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentFoods, setRecentFoods] = useState([]);
  const [customFoods, setCustomFoods] = useState([]);
  const [reminders, setReminders] = useState(DEFAULT_REMINDERS);
  const [grocery, setGrocery] = useState(() => seedGrocery());
  const [mealPlan, setMealPlan] = useState(() => seedMealPlan());
  const skipSave = useRef(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(DIARY_STATE_KEY);
        if (cancelled) return;
        if (raw) {
          const saved = JSON.parse(raw);
          const key = saved.dateKey || todayKey();
          let nextDays = saved.days || {};
          // Empty today → seed demo meals so Home progress isn't stuck at 0.
          if (!dayHasFood(nextDays[key])) {
            nextDays = { ...nextDays, [key]: seedDemoDay() };
          }
          setDateKeyState(key);
          setDays(nextDays);
          setGoal(saved.goal || 'lose');
          setProfile({ ...DEFAULT_PROFILE, ...(saved.profile || {}) });
          setWeightLogs(Array.isArray(saved.weightLogs) ? saved.weightLogs : []);
          setFavorites(Array.isArray(saved.favorites) ? saved.favorites : []);
          setRecentFoods(Array.isArray(saved.recentFoods) ? saved.recentFoods : []);
          setCustomFoods(Array.isArray(saved.customFoods) ? saved.customFoods : []);
          setReminders({ ...DEFAULT_REMINDERS, ...(saved.reminders || {}) });
          setGrocery(Array.isArray(saved.grocery) && saved.grocery.length ? saved.grocery : seedGrocery());
          setMealPlan(
            saved.mealPlan && typeof saved.mealPlan === 'object' && Object.keys(saved.mealPlan).length
              ? saved.mealPlan
              : seedMealPlan(),
          );
        } else {
          setDays(seedDays());
        }
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) {
          setHydrated(true);
          skipSave.current = false;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || skipSave.current) return;
    const payload = {
      dateKey,
      days,
      goal,
      profile,
      weightLogs,
      favorites,
      recentFoods,
      customFoods,
      reminders,
      grocery,
      mealPlan,
    };
    AsyncStorage.setItem(DIARY_STATE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [
    hydrated,
    dateKey,
    days,
    goal,
    profile,
    weightLogs,
    favorites,
    recentFoods,
    customFoods,
    reminders,
    grocery,
    mealPlan,
  ]);

  const setDateKey = useCallback((key) => {
    setDateKeyState(key);
    setDays((prev) => (prev[key] ? prev : { ...prev, [key]: emptyDay() }));
  }, []);

  const patchDay = useCallback((key, updater) => {
    setDays((prev) => {
      const current = dayOrEmpty(prev, key);
      const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
      return { ...prev, [key]: next };
    });
  }, []);

  const day = dayOrEmpty(days, dateKey);
  const meals = day.meals;
  const exercise = day.exercise;
  const water = day.water;

  useEffect(() => {
    if (water > profile.waterGoal) {
      patchDay(dateKey, (d) => ({ ...d, water: profile.waterGoal }));
    }
  }, [profile.waterGoal, water, dateKey, patchDay]);

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

  const pushRecent = useCallback((food) => {
    const entry = {
      id: food.id || food.foodId || `custom-${Date.now()}`,
      name: food.name,
      brand: food.brand || 'Custom',
      serving: food.serving,
      calories: food.calories,
      carbs: food.carbs,
      protein: food.protein,
      fat: food.fat,
    };
    setRecentFoods((prev) => {
      const filtered = prev.filter((f) => f.id !== entry.id && f.name !== entry.name);
      return [entry, ...filtered].slice(0, 20);
    });
  }, []);

  const addFood = useCallback(
    (meal, food) => {
      const entry = {
        logId: `log-${Date.now()}`,
        foodId: food.id || food.foodId,
        name: food.name,
        serving: food.serving,
        calories: food.calories,
        carbs: food.carbs || 0,
        protein: food.protein || 0,
        fat: food.fat || 0,
        fiber: food.fiber || 0,
        sugar: food.sugar || 0,
        sodium: food.sodium || 0,
      };
      patchDay(dateKey, (d) => ({
        ...d,
        meals: {
          ...d.meals,
          [meal]: [...(d.meals[meal] || []), entry],
        },
      }));
      pushRecent(food);
    },
    [dateKey, patchDay, pushRecent],
  );

  const removeFood = useCallback(
    (meal, logId) => {
      patchDay(dateKey, (d) => ({
        ...d,
        meals: {
          ...d.meals,
          [meal]: (d.meals[meal] || []).filter((item) => item.logId !== logId),
        },
      }));
    },
    [dateKey, patchDay],
  );

  const addCustomFood = useCallback((food) => {
    const entry = {
      id: `cf-${Date.now()}`,
      brand: food.brand || 'Custom',
      ...food,
    };
    setCustomFoods((prev) => [entry, ...prev]);
    return entry;
  }, []);

  const addExercise = useCallback(
    (item) => {
      patchDay(dateKey, (d) => ({
        ...d,
        exercise: [...d.exercise, { logId: `ex-${Date.now()}`, ...item }],
      }));
    },
    [dateKey, patchDay],
  );

  const removeExercise = useCallback(
    (logId) => {
      patchDay(dateKey, (d) => ({
        ...d,
        exercise: d.exercise.filter((item) => item.logId !== logId),
      }));
    },
    [dateKey, patchDay],
  );

  const addWater = useCallback(() => {
    patchDay(dateKey, (d) => ({
      ...d,
      water: Math.min(d.water + 1, profile.waterGoal),
    }));
  }, [dateKey, patchDay, profile.waterGoal]);

  const addWaterAmount = useCallback(
    (glasses) => {
      const n = Number(glasses) || 0;
      if (n <= 0) return;
      patchDay(dateKey, (d) => ({
        ...d,
        water: Math.min(d.water + n, profile.waterGoal),
      }));
    },
    [dateKey, patchDay, profile.waterGoal],
  );

  const resetWater = useCallback(() => {
    patchDay(dateKey, (d) => ({ ...d, water: 0 }));
  }, [dateKey, patchDay]);

  const resetDay = useCallback(() => {
    patchDay(dateKey, emptyDay());
  }, [dateKey, patchDay]);

  const resetForTesting = useCallback(() => {
    skipSave.current = true;
    setDateKeyState(todayKey());
    setDays(seedDays());
    setGoal('lose');
    setProfile(DEFAULT_PROFILE);
    setWeightLogs([]);
    setFavorites([]);
    setRecentFoods([]);
    setCustomFoods([]);
    setReminders(DEFAULT_REMINDERS);
    setGrocery(seedGrocery());
    setMealPlan(seedMealPlan());
    AsyncStorage.removeItem(DIARY_STATE_KEY).finally(() => {
      skipSave.current = false;
      // Persist demo day after reset so reload keeps filled progress.
      AsyncStorage.setItem(
        DIARY_STATE_KEY,
        JSON.stringify({
          ...DEFAULT_STATE,
          dateKey: todayKey(),
          days: seedDays(),
        }),
      ).catch(() => {});
    });
  }, []);

  const updateProfile = useCallback((patch) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const addWeightLog = useCallback((weight) => {
    const value = Number(weight);
    if (!value || Number.isNaN(value)) return;
    const entry = {
      id: `w-${Date.now()}`,
      date: todayKey(),
      weight: Math.round(value * 10) / 10,
    };
    setWeightLogs((prev) => [entry, ...prev.filter((w) => w.date !== entry.date)]);
    setProfile((prev) => ({ ...prev, weight: entry.weight }));
  }, []);

  const toggleFavorite = useCallback((foodId) => {
    setFavorites((prev) =>
      prev.includes(foodId) ? prev.filter((id) => id !== foodId) : [...prev, foodId],
    );
  }, []);

  const updateReminder = useCallback((key, value) => {
    setReminders((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleGroceryItem = useCallback((id) => {
    setGrocery((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  }, []);

  const addGroceryItem = useCallback((item) => {
    setGrocery((prev) => [
      {
        id: `g-${Date.now()}`,
        aisle: item.aisle || 'Other',
        name: item.name,
        qty: item.qty || '1',
        checked: false,
      },
      ...prev,
    ]);
  }, []);

  const removeGroceryItem = useCallback((id) => {
    setGrocery((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateGroceryItem = useCallback((id, patch) => {
    setGrocery((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const addMealPlanItem = useCallback((dayKey, item) => {
    setMealPlan((prev) => ({
      ...prev,
      [dayKey]: [
        ...(prev[dayKey] || []),
        {
          id: `mp-${Date.now()}`,
          mealType: item.mealType || 'Snack',
          name: item.name,
          calories: Number(item.calories) || 0,
          protein: Number(item.protein) || 0,
          carbs: Number(item.carbs) || 0,
          fat: Number(item.fat) || 0,
        },
      ],
    }));
  }, []);

  const removeMealPlanItem = useCallback((dayKey, id) => {
    setMealPlan((prev) => ({
      ...prev,
      [dayKey]: (prev[dayKey] || []).filter((m) => m.id !== id),
    }));
  }, []);

  const updateMealPlanItem = useCallback((dayKey, id, patch) => {
    setMealPlan((prev) => ({
      ...prev,
      [dayKey]: (prev[dayKey] || []).map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }, []);

  const value = {
    hydrated,
    dateKey,
    setDateKey,
    days,
    meals,
    exercise,
    water,
    goal,
    setGoal,
    profile,
    updateProfile,
    totals,
    burned,
    remaining,
    addFood,
    removeFood,
    addCustomFood,
    customFoods,
    recentFoods,
    addExercise,
    removeExercise,
    addWater,
    addWaterAmount,
    resetWater,
    resetDay,
    resetForTesting,
    weightLogs,
    addWeightLog,
    favorites,
    toggleFavorite,
    reminders,
    updateReminder,
    grocery,
    toggleGroceryItem,
    addGroceryItem,
    removeGroceryItem,
    updateGroceryItem,
    mealPlan,
    addMealPlanItem,
    removeMealPlanItem,
    updateMealPlanItem,
  };

  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
}

export function useDiary() {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error('useDiary must be used within DiaryProvider');
  return ctx;
}
