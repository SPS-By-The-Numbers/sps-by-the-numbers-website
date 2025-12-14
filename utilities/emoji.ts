const EMOJI_FRUIT = [
  "🍎",
  "🍊",
  "🍒",
  "🍋",
  "🍍",
  "🫐",
  "🥝",
  "🫒",
  "🥥",
  "🍑",
  "🥭",
];

export function toEmojiPrefix(ordinal) {
  if (typeof ordinal === "number") {
    return ordinal < EMOJI_FRUIT.length ? EMOJI_FRUIT[ordinal] : ordinal + "";
  }

  return ordinal;
}
