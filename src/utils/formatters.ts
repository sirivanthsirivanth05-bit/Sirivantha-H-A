export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateString;
  }
}

export function getDaysRemaining(targetDateStr?: string): { days: number; label: string; isUrgent: boolean } {
  if (!targetDateStr) return { days: 999, label: 'No date set', isUrgent: false };
  const target = new Date(targetDateStr).getTime();
  const now = new Date().getTime();
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: diffDays, label: 'Past due', isUrgent: true };
  }
  if (diffDays === 0) {
    return { days: 0, label: 'Today!', isUrgent: true };
  }
  if (diffDays === 1) {
    return { days: 1, label: 'Tomorrow', isUrgent: true };
  }
  return {
    days: diffDays,
    label: `${diffDays} days left`,
    isUrgent: diffDays <= 7,
  };
}

export function getGradeLetter(percentage: number): { letter: string; color: string } {
  if (percentage >= 93) return { letter: 'A+', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (percentage >= 90) return { letter: 'A', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (percentage >= 85) return { letter: 'B+', color: 'text-teal-600 bg-teal-50 border-teal-200' };
  if (percentage >= 80) return { letter: 'B', color: 'text-blue-600 bg-blue-50 border-blue-200' };
  if (percentage >= 70) return { letter: 'C', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  return { letter: 'Needs Review', color: 'text-rose-600 bg-rose-50 border-rose-200' };
}
