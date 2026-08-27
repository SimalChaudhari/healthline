/** Health condition tracks — adapted from Nourish example. */
import { APP_NAME } from '../config/brandContent';

export const HEALTH_TRACKS = {
  PCOS: {
    id: 'PCOS',
    name: 'PCOS / PCOD',
    initials: 'PC',
    cycle: true,
    sub: `Insulin resistance sits behind most PCOS symptoms. ${APP_NAME} builds plates that keep glucose flat and protein high.`,
    symptoms: ['Fatigue', 'Bloating', 'Cravings', 'Acne', 'Hair fall', 'Mood dips', 'Cramps', 'Poor sleep'],
    eat: ['Protein at every meal', 'Leafy greens, berries', 'Whole grains over white', 'Omega-3: seeds, walnuts', 'Cinnamon, spearmint tea'],
    limit: ['Sugary drinks', 'Refined carbs alone', 'Long gaps between meals', 'Ultra-processed snacks'],
    insight: 'Your bloating days are the four days you ate under 60 g of protein. Front-load protein at breakfast this week.',
    metrics: [
      ['Symptom-free days', 'Logged this week', '4/7'],
      ['Avg protein', 'Target 130 g', '118 g'],
      ['Steps', 'Insulin sensitivity', '7.9k'],
    ],
  },
  Thyroid: {
    id: 'Thyroid',
    name: 'Thyroid support',
    initials: 'TH',
    cycle: false,
    sub: 'For hypothyroidism: steady energy, enough iodine and selenium, and meal timing that does not collide with medication.',
    symptoms: ['Fatigue', 'Cold hands', 'Brain fog', 'Weight gain', 'Dry skin', 'Hair fall', 'Constipation', 'Low mood'],
    eat: ['Selenium: brazil nuts, eggs', 'Iodine: fish, dairy, iodised salt', 'Zinc: lean meat, pumpkin seeds', 'Fibre for slow digestion'],
    limit: ['Coffee within 1 h of meds', 'Raw cruciferous in bulk', 'Soy near your dose', 'Very low-calorie days'],
    insight: 'Push breakfast out to 60 minutes after levothyroxine and absorption improves measurably.',
    metrics: [
      ['Energy score', 'Self-reported', '6.4'],
      ['Med timing kept', '60 min gap', '3/7'],
      ['Fibre', 'Target 30 g', '27 g'],
    ],
  },
  Diabetes: {
    id: 'Diabetes',
    name: 'Blood sugar',
    initials: 'BS',
    cycle: false,
    sub: 'Pre-diabetes and type 2: flatten the curve. Every meal is scored for glucose impact.',
    symptoms: ['Energy crashes', 'Thirst', 'Blurry vision', 'Cravings', 'Slow healing'],
    eat: ['Protein + fibre first', 'Non-starchy vegetables', 'Whole grains in moderation', 'Post-meal walks'],
    limit: ['Sugary drinks', 'Large carb-only meals', 'Late-night snacking', 'Ultra-processed foods'],
    insight: 'Post-meal walks of 10 minutes cut your afternoon glucose spikes by about 18%.',
    metrics: [
      ['Fasting glucose', 'Home reading', '5.4'],
      ['Post-meal walks', '10 min each', '12'],
      ['Carb timing', 'Before 8 pm', '5/7'],
    ],
  },
  BP: {
    id: 'BP',
    name: 'Blood pressure',
    initials: 'BP',
    cycle: false,
    sub: 'Sodium is the lever, but potassium and weight matter almost as much. High-sodium items are flagged before you log.',
    symptoms: ['Headache', 'Dizziness', 'Palpitations', 'Swollen ankles', 'Poor sleep'],
    eat: ['Potassium: banana, spinach', 'Unsalted nuts', 'Home-cooked over takeaway', 'Beetroot, oats'],
    limit: ['Sauces and dressings', 'Cured and processed meat', 'Instant noodles', 'Alcohol'],
    insight: 'Two swapped takeaway orders a week gets you under sodium target without cooking more.',
    metrics: [
      ['Avg sodium', 'Target 2.0 g', '2.3 g'],
      ['Home-cooked', 'Meals this week', '15'],
      ['BP log', 'Last reading', '128/82'],
    ],
  },
};

export const TRACK_LIST = Object.values(HEALTH_TRACKS);

export function getHealthTrack(id) {
  return HEALTH_TRACKS[id] || null;
}
