export type BreastType = 'left' | 'right' | 'both' | 'bottle';

export interface FeedingSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  breastType: BreastType;
  bottleVolume?: number; // in ml
  notes?: string;
  isActive?: boolean;
}

export interface LiveSession {
  id: string;
  startTime: Date;
  currentBreast: BreastType;
  bottleVolume?: number; // in ml
  isPaused: boolean;
  pausedTime: number;
  totalTime: number;
}

export interface DailySummary {
  date: string;
  totalSessions: number;
  totalTime: number;
  leftBreastTime: number;
  rightBreastTime: number;
  bottleTime: number;
  bottleVolume: number;
}
