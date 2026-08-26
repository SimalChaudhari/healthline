/** Shared form validation helpers (local UI auth). */

export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 64;

export function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

export function isValidEmail(email) {
  const e = normalizeEmail(email);
  // Practical email check — not RFC-complete
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

export function validateEmail(email) {
  const raw = String(email || '').trim();
  if (!raw) return 'Email is required.';
  if (!isValidEmail(raw)) return 'Enter a valid email address.';
  return '';
}

/** Password rules shown as live checklist under the field (register). */
export function passwordRules(password) {
  const p = String(password || '');
  return [
    { id: 'length', label: `At least ${PASSWORD_MIN} characters`, ok: p.length >= PASSWORD_MIN },
    { id: 'lower', label: 'One lowercase letter (a–z)', ok: /[a-z]/.test(p) },
    { id: 'upper', label: 'One capital letter (A–Z)', ok: /[A-Z]/.test(p) },
    { id: 'number', label: 'One number (0–9)', ok: /\d/.test(p) },
    { id: 'special', label: 'One special character (!@#…)', ok: /[^A-Za-z0-9]/.test(p) },
  ];
}

/**
 * Password strength 0–5 = how many checklist rules pass.
 */
export function passwordStrength(password) {
  return passwordRules(password).filter((r) => r.ok).length;
}

export function passwordStrengthLabel(score) {
  if (score <= 0) return '';
  if (score <= 1) return 'Very weak';
  if (score === 2) return 'Weak';
  if (score === 3) return 'Fair';
  if (score === 4) return 'Strong';
  return 'Very strong';
}

export function passwordStrengthColor(score) {
  if (score <= 1) return '#FF3B30';
  if (score === 2) return '#FF9500';
  if (score === 3) return '#FFCC00';
  if (score === 4) return '#34C759';
  return '#00B67A';
}

/** Full rules for register / create account. */
export function validatePassword(password) {
  const p = String(password || '');
  if (!p) return 'Password is required.';
  if (p.length > PASSWORD_MAX) {
    return `Password must be at most ${PASSWORD_MAX} characters.`;
  }
  const failed = passwordRules(p).filter((r) => !r.ok);
  if (failed.length) {
    return `Add: ${failed.map((r) => r.label.replace(/^One /, '').replace(/^At least /, '')).join(', ')}.`;
  }
  return '';
}

/** Lighter check for sign-in — required + min/max length. */
export function validateLoginPassword(password) {
  const p = String(password || '');
  if (!p) return 'Password is required.';
  if (p.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters.`;
  }
  if (p.length > PASSWORD_MAX) {
    return `Password must be at most ${PASSWORD_MAX} characters.`;
  }
  return '';
}

export function validateConfirmPassword(password, confirm) {
  if (!String(confirm || '')) return 'Confirm your password.';
  if (String(password) !== String(confirm)) return 'Passwords do not match.';
  return '';
}

export function validateRequired(value, label = 'This field') {
  if (!String(value || '').trim()) return `${label} is required.`;
  return '';
}

export function validateName(value, label = 'Name') {
  const v = String(value || '').trim();
  if (!v) return `${label} is required.`;
  if (v.length < 2) return `${label} must be at least 2 characters.`;
  if (!/^[A-Za-z][A-Za-z\s'-]*$/.test(v)) {
    return `${label} can only use letters, spaces, ' or -.`;
  }
  return '';
}

export function validateAge(value) {
  const raw = String(value || '').trim();
  if (!raw) return 'Age is required.';
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return 'Enter a whole number for age.';
  if (n < 13 || n > 120) return 'Age must be between 13 and 120.';
  return '';
}

export function validateHeightCm(value) {
  const raw = String(value || '').trim();
  if (!raw) return 'Height is required.';
  const n = Number(raw);
  if (!Number.isFinite(n)) return 'Enter a valid height.';
  if (n < 100 || n > 250) return 'Height must be between 100 and 250 cm.';
  return '';
}

export function validateWeightKg(value, label = 'Weight') {
  const raw = String(value || '').trim();
  if (!raw) return `${label} is required.`;
  const n = Number(raw);
  if (!Number.isFinite(n)) return `Enter a valid ${label.toLowerCase()}.`;
  if (n < 30 || n > 300) return `${label} must be between 30 and 300 kg.`;
  return '';
}

