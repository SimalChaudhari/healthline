/** Wellness / fitness programs — adapted from Nourish example. */
export const ACTIVE_PROGRAM_ID = 'six-pack';

export const PROGRAM_GROUPS = [
  {
    title: 'Build & shape',
    sub: 'Progressive strength and core work with a form video for every move.',
    programs: [
      { id: 'six-pack', title: 'Six-pack foundations', meta: '12 weeks · 4×/wk · core, cardio, deficit', status: 'Active', weeks: 12, sessionsPerWeek: 4 },
      { id: 'lean-muscle', title: 'Lean muscle, full body', meta: '16 weeks · 3×/wk · gym or dumbbells', status: 'Popular', weeks: 16, sessionsPerWeek: 3 },
      { id: 'beginner-strength', title: 'Beginner strength', meta: '8 weeks · 3×/wk · starts at bodyweight', status: 'Start', weeks: 8, sessionsPerWeek: 3 },
      { id: 'home-burn', title: 'Home bodyweight burn', meta: '6 weeks · 5×/wk · 20 min, no kit', status: 'Start', weeks: 6, sessionsPerWeek: 5 },
    ],
  },
  {
    title: 'Get healthy again',
    sub: 'For low energy, high weight, or getting back on your feet after illness.',
    programs: [
      { id: 'reset-8', title: 'Reset: 8 weeks to steady', meta: '8 weeks · walk, sleep, simple meals', status: 'Start', weeks: 8, sessionsPerWeek: 3 },
      { id: 'heart-bp', title: 'Heart & blood pressure', meta: '10 weeks · sodium, fibre, movement', status: 'Start', weeks: 10, sessionsPerWeek: 3 },
      { id: 'blood-sugar', title: 'Blood-sugar reset', meta: '12 weeks · glucose-friendly plates', status: 'Start', weeks: 12, sessionsPerWeek: 4 },
    ],
  },
  {
    title: "Women's health",
    sub: 'Condition-aware nutrition, symptom logging and cycle-synced targets.',
    programs: [
      { id: 'pcos-nutrition', title: 'PCOS / PCOD nutrition', meta: '12 weeks · insulin-friendly', status: 'Tracking', weeks: 12, sessionsPerWeek: 3 },
      { id: 'thyroid', title: 'Thyroid support', meta: '10 weeks · iodine, selenium, energy pacing', status: 'Start', weeks: 10, sessionsPerWeek: 3 },
    ],
  },
];

export const PROGRAM_SESSIONS = {
  'six-pack': [
    { id: 's1', week: 1, title: 'Core activation & form', duration: '18 min', done: true },
    { id: 's2', week: 1, title: 'Low-impact cardio', duration: '22 min', done: true },
    { id: 's3', week: 2, title: 'Core & cardio', duration: '22 min', done: false },
    { id: 's4', week: 2, title: 'Full-body strength intro', duration: '25 min', done: false },
    { id: 's5', week: 3, title: 'Progressive core', duration: '24 min', done: false },
  ],
};

export function getProgramById(id) {
  for (const group of PROGRAM_GROUPS) {
    const found = group.programs.find((p) => p.id === id);
    if (found) return { ...found, groupTitle: group.title };
  }
  return null;
}

export function getProgramProgress(id) {
  const sessions = PROGRAM_SESSIONS[id] || [];
  const done = sessions.filter((s) => s.done).length;
  return { done, total: sessions.length, pct: sessions.length ? done / sessions.length : 0 };
}
