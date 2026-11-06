const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function getDayOfWeek(date) {
  const d = new Date(date);
  return DAY_NAMES[d.getDay()];
}

export function parseTimeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function timesOverlap(startA, endA, startB, endB) {
  const a1 = parseTimeToMinutes(startA);
  const a2 = parseTimeToMinutes(endA);
  const b1 = parseTimeToMinutes(startB);
  const b2 = parseTimeToMinutes(endB);
  return a1 < b2 && b1 < a2;
}

export function startOfDay(dateInput) {
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(dateInput) {
  const d = new Date(dateInput);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function isSameCalendarDay(a, b) {
  const d1 = startOfDay(a);
  const d2 = startOfDay(b);
  return d1.getTime() === d2.getTime();
}
