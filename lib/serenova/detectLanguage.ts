const INDONESIAN_KEYWORDS = [
  "saya", "aku", "kamu", "yang", "dan", "dengan", "gue", "lu", "ada",
  "capek", "sedih", "lagi", "ini", "itu", "ke", "di", "dari", "aja",
  "bosen", "gabut", "bete", "kok", "sih", "dong", "ya", "iya", "tidak", "nggak",
];

export function detectLanguage(text: string): "en" | "id" {
  const words = text.toLowerCase().split(/\s+/);
  const count = words.filter((w) => INDONESIAN_KEYWORDS.includes(w)).length;
  return count >= 2 || (words.length > 0 && count / words.length > 0.15)
    ? "id"
    : "en";
}
