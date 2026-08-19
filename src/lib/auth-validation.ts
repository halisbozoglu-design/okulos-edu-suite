export function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidTckn(value: string) {
  if (!/^\d{11}$/.test(value) || value[0] === "0") return false;
  const d = value.split("").map(Number);
  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  const tenth = ((odd * 7 - even) % 10 + 10) % 10;
  const eleventh = d.slice(0, 10).reduce((sum, n) => sum + n, 0) % 10;
  return d[9] === tenth && d[10] === eleventh;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function normalizeTrPhone(value: string) {
  return normalizeDigits(value).slice(0, 11);
}

export function isValidTrMobile(value: string) {
  return /^05\d{9}$/.test(normalizeTrPhone(value));
}

export type PasswordStrength = {
  valid: boolean;
  checks: {
    length: boolean;
    lower: boolean;
    upper: boolean;
    number: boolean;
    special: boolean;
  };
};

export function getPasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 10,
    lower: /[a-zçğıöşü]/.test(password),
    upper: /[A-ZÇĞİÖŞÜ]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9ÇĞİÖŞÜçğıöşü]/.test(password),
  };
  return { valid: Object.values(checks).every(Boolean), checks };
}

export function looksLikeEmail(value: string) {
  return value.includes("@");
}
