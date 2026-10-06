import { Appointment, DaySchedule, Service, TimeSlot, WorkingConfig } from '../types';

/**
 * Converts "HH:MM" to total minutes from midnight (0 to 1439)
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Converts total minutes from midnight back to "HH:MM"
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Calculate the end time given a start time and duration in minutes
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMins = timeToMinutes(startTime);
  const endMins = startMins + durationMinutes;
  return minutesToTime(endMins);
}

/**
 * Checks if two time windows overlap, optionally considering a buffer between them
 */
export function checkIntervalOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
  bufferMinutes: number = 0
): boolean {
  // A ends before B starts (including buffer) OR B ends before A starts (including buffer)
  return !(endA + bufferMinutes <= startB || endB + bufferMinutes <= startA);
}

/**
 * Checks if a given slot is in the past for today's date
 */
export function isSlotInPast(dateStr: string, timeStr: string, minNoticeMinutes: number = 30): boolean {
  const now = new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  const slotDate = new Date(year, month - 1, day, hours, minutes);
  const cutoffDate = new Date(now.getTime() + minNoticeMinutes * 60 * 1000);

  return slotDate.getTime() <= cutoffDate.getTime();
}

/**
 * Generates all potential time slots for a given day configuration, service duration and appointments
 */
export function generateAvailableSlots(
  dateStr: string,
  service: Service,
  workingConfig: WorkingConfig,
  existingAppointments: Appointment[]
): TimeSlot[] {
  const [year, month, day] = dateStr.split('-').map(Number);
  const selectedDate = new Date(year, month - 1, day);
  const dayOfWeek = selectedDate.getDay(); // 0 = Sun, 1 = Mon ...

  const dayConfig: DaySchedule | undefined = workingConfig.days.find((d) => d.dayOfWeek === dayOfWeek);

  if (!dayConfig || !dayConfig.isOpen) {
    return [];
  }

  const startDayMins = timeToMinutes(dayConfig.startHour);
  const endDayMins = timeToMinutes(dayConfig.endHour);
  const breakStartMins = dayConfig.breakStart ? timeToMinutes(dayConfig.breakStart) : null;
  const breakEndMins = dayConfig.breakEnd ? timeToMinutes(dayConfig.breakEnd) : null;

  const interval = workingConfig.slotIntervalMinutes || 30;
  const buffer = workingConfig.bufferBetweenMinutes || 0;
  const serviceDuration = service.durationMinutes;

  // Active appointments for this date (excluding cancelled)
  const activeAppointments = existingAppointments.filter(
    (app) => app.date === dateStr && app.status !== 'cancelado'
  );

  const slots: TimeSlot[] = [];

  for (let currentMins = startDayMins; currentMins + serviceDuration <= endDayMins; currentMins += interval) {
    const slotTimeStr = minutesToTime(currentMins);
    const slotEndMins = currentMins + serviceDuration;
    const slotEndTimeStr = minutesToTime(slotEndMins);

    // Rule 1: Past time check
    if (isSlotInPast(dateStr, slotTimeStr, workingConfig.minNoticeMinutes || 30)) {
      slots.push({
        time: slotTimeStr,
        endTime: slotEndTimeStr,
        available: false,
        reason: 'passado',
      });
      continue;
    }

    // Rule 2: Lunch / Break time collision
    if (breakStartMins !== null && breakEndMins !== null) {
      if (checkIntervalOverlap(currentMins, slotEndMins, breakStartMins, breakEndMins, 0)) {
        slots.push({
          time: slotTimeStr,
          endTime: slotEndTimeStr,
          available: false,
          reason: 'almoco',
        });
        continue;
      }
    }

    // Rule 3: Existing appointment collision
    let hasConflict = false;
    for (const app of activeAppointments) {
      const appStartMins = timeToMinutes(app.time);
      const appEndMins = timeToMinutes(app.endTime);

      if (checkIntervalOverlap(currentMins, slotEndMins, appStartMins, appEndMins, buffer)) {
        hasConflict = true;
        break;
      }
    }

    if (hasConflict) {
      slots.push({
        time: slotTimeStr,
        endTime: slotEndTimeStr,
        available: false,
        reason: 'ocupado',
      });
      continue;
    }

    // If all pass, slot is available!
    slots.push({
      time: slotTimeStr,
      endTime: slotEndTimeStr,
      available: true,
    });
  }

  return slots;
}
