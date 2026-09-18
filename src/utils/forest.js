/** Лес растёт от 0 до 100+ очков; уровни для визуализации */
export const FOREST_MAX_DISPLAY = 100;

export function forestLevel(points) {
  if (points >= 100) return 5;
  if (points >= 75) return 4;
  if (points >= 50) return 3;
  if (points >= 25) return 2;
  if (points >= 10) return 1;
  return 0;
}

export function forestTitle(level) {
  const titles = [
    'Пустая поляна',
    'Первые ростки',
    'Молодой лесок',
    'Зелёная роща',
    'Большой лес',
    'Волшебный лес друзей природы!',
  ];
  return titles[level] ?? titles[0];
}
