import { BusDeparture, LaMetricResponse } from '../types/types';

export function formatForLametric(departures: BusDeparture[]): LaMetricResponse {
  // Group departures by line number
  const groupedDepartures = departures.reduce((acc, departure) => {
    if (!acc[departure.line]) {
      acc[departure.line] = [];
    }
    acc[departure.line].push(departure.time);
    return acc;
  }, {} as Record<string, string[]>);

  // Create frames for each line with up to 2 departure times
  const frames = Object.entries(groupedDepartures).map(([line, times]) => ({
    text: `${line}: ${times.slice(0, 2).join(' ')}`,
    icon: 'a6175', // Icon for bus
  }));

  return { frames };
}