// Date and Time Utilities for Focus HQ (Russian interface)

export function getGreeting(hour?: number): string {
  const h = hour !== undefined ? hour : new Date().getHours();
  if (h >= 5 && h < 12) return 'Доброе утро';
  if (h >= 12 && h < 18) return 'Добрый день';
  if (h >= 18 && h < 23) return 'Добрый вечер';
  return 'Доброй ночи';
}

export function formatDateToRussian(dateInput: Date | string): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  const formatted = d.toLocaleDateString('ru-RU', options);
  // Capitalize first letter (e.g. "Четверг, 19 ноября...")
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatShortDateRu(dateInput: Date | string): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPastDaysList(count: number): { date: string; dayName: string; shortDate: string }[] {
  const list = [];
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayName = d.toLocaleDateString('ru-RU', { weekday: 'short' });
    const shortDate = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' });
    list.push({
      date: dateStr,
      dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      shortDate
    });
  }
  return list;
}

export function getCurrentWeekDays(): { date: string; dayName: string; dayNumber: number; isToday: boolean }[] {
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
  // In Russian week starts on Monday (1). Sunday is 7.
  const distanceToMonday = (currentDayOfWeek + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);

  const days = [];
  const todayStr = getTodayString();

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayName = d.toLocaleDateString('ru-RU', { weekday: 'short' });
    days.push({
      date: dateStr,
      dayName: dayName.toUpperCase(),
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr
    });
  }
  return days;
}

/**
 * Calculates current streak (consecutive days with at least 1 completed task)
 */
export function calculateStreak(completedDates: string[]): number {
  if (!completedDates || completedDates.length === 0) return 0;

  // Unique sorted dates descending
  const uniqueDates = Array.from(new Set(completedDates)).sort().reverse();
  const today = getTodayString();
  
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

  // Streak is alive if there is a completion today OR yesterday
  let checkDate = new Date();
  if (uniqueDates.includes(today)) {
    // completed today, count starts from today
    checkDate = new Date();
  } else if (uniqueDates.includes(yesterday)) {
    // completed yesterday, count starts from yesterday
    checkDate = yesterdayDate;
  } else {
    // No task completed today or yesterday -> streak broken
    return 0;
  }

  let streak = 0;
  while (true) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const targetStr = `${y}-${m}-${d}`;

    if (uniqueDates.includes(targetStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
